import crypto from "crypto";
import axios from "axios";
import { Op } from "sequelize";
import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import Doctor from "../models/doctor.model.js";
import Transaction from "../models/transaction.model.js";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
  generateRandomString,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  PAYMENT_STATUS,
  APPOINTMENT_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Generate eSewa Signature
 */
const generateEsewaSignature = (totalAmount, transactionUuid, productCode) => {
  const data = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac(
    "sha256",
    process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q",
  );
  hmac.update(data);
  return hmac.digest("base64");
};

/**
 * Initiate payment for an appointment
 * @route POST /api/payments/initiate
 */
export const initiatePayment = async (req, res) => {
  try {
    const { appointment_id, amount, payment_method = "esewa" } = req.body;

    // Find appointment
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["user_id", "full_name", "email", "phone"],
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
        {
          model: Doctor,
          required: false,
          include: [{ model: User, attributes: ["full_name"] }],
        },
      ],
    });

    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check permissions
    if (req.user.role !== "Admin" && req.user.id !== appointment.patient_id) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only pay for your own appointments",
      );
    }

    // Check if appointment is confirmed
    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Payment can only be initiated for confirmed appointments",
      );
    }

    // Check if already paid
    if (appointment.payment_status === PAYMENT_STATUS.PAID) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "This appointment has already been paid for",
      );
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid payment amount",
      );
    }

    // Generate transaction identifier
    // We use a combination to ensure uniqueness for retries if needed, but keeping mapping clear
    const transactionUuid = `${appointment_id}-${Date.now()}`;
    const productCode = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";

    // Create Transaction Record
    const transaction = await Transaction.create({
      transaction_uuid: transactionUuid,
      customer_name: appointment.Patient?.full_name || "Unknown",
      customer_email: appointment.Patient?.email,
      customer_phone: appointment.Patient?.phone,
      product_name: `Appointment #${appointment_id}`,
      product_id: appointment_id.toString(),
      amount: amount,
      payment_gateway: payment_method,
      status: "PENDING",
    });

    if (payment_method === "esewa") {
      const amountStr = amount.toString();
      const signature = generateEsewaSignature(
        amountStr,
        transactionUuid,
        productCode,
      );

      const params = {
        amount: amountStr,
        failure_url: process.env.FAILURE_URL || "http://localhost:5173/failure",
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: productCode,
        signature: signature,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: process.env.SUCCESS_URL || "http://localhost:5173/success",
        tax_amount: "0",
        total_amount: amountStr,
        transaction_uuid: transactionUuid,
      };

      return successResponse(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGES.PAYMENT_INITIATED,
        {
          payment_method: "esewa",
          params,
          url:
            process.env.ESEWA_PAYMENT_URL ||
            "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
          transaction_id: transaction.transaction_id,
        },
      );
    } else if (payment_method === "khalti") {
      const payload = {
        return_url: process.env.SUCCESS_URL || "http://localhost:5173/success",
        website_url: process.env.FRONTEND_URL || "http://localhost:5173",
        amount: amount * 100, // Khalti expects paisa
        purchase_order_id: transactionUuid,
        purchase_order_name: `Appointment #${appointment_id}`,
        customer_info: {
          name: appointment.Patient?.full_name || "Customer",
          email: appointment.Patient?.email || "test@example.com",
          phone: appointment.Patient?.phone || "9800000000",
        },
      };

      const khaltiResponse = await axios.post(
        process.env.KHALTI_PAYMENT_URL ||
          "https://a.khalti.com/api/v2/epayment/initiate/",
        payload,
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Save pidx to transaction
      if (khaltiResponse.data.pidx) {
        transaction.gateway_reference = khaltiResponse.data.pidx;
        await transaction.save();
      }

      return successResponse(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGES.PAYMENT_INITIATED,
        {
          payment_method: "khalti",
          url: khaltiResponse.data.payment_url,
          pidx: khaltiResponse.data.pidx,
          transaction_id: transaction.transaction_id,
        },
      );
    } else {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid payment method. Supported methods: esewa, khalti",
      );
    }
  } catch (error) {
    console.error(
      "Initiate payment error:",
      error.response?.data || error.message,
    );
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Confirm payment callback from payment gateway
 * @route POST /api/payments/confirm
 */
export const confirmPayment = async (req, res) => {
  try {
    const { product_id, pidx } = req.body; // product_id maps to transaction_uuid
    console.log(`[Payment Confirmation] Request received:`, {
      product_id,
      pidx,
    });

    // Find Transaction
    let transaction;
    if (pidx) {
      transaction = await Transaction.findOne({
        where: { gateway_reference: pidx },
      });
    } else if (product_id) {
      transaction = await Transaction.findOne({
        where: { transaction_uuid: product_id },
      });
    }

    if (!transaction) {
      console.log(`[Payment Confirmation] Transaction not found for:`, {
        product_id,
        pidx,
      });
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Transaction not found");
    }

    console.log(
      `[Payment Confirmation] Transaction found:`,
      transaction.toJSON(),
    );

    // Prevent re-processing if already completed
    if (transaction.status === "COMPLETED") {
      const appointment = await Appointment.findByPk(transaction.product_id);
      return successResponse(res, HTTP_STATUS.OK, "Payment already confirmed", {
        status: "COMPLETED",
        transaction,
        appointment,
      });
    }

    const appointment = await Appointment.findByPk(transaction.product_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    let verificationStatus = "PENDING";
    let gatewayResponse = {};

    if (transaction.payment_gateway === "esewa") {
      // Verify with eSewa
      const checkUrl =
        process.env.ESEWA_PAYMENT_STATUS_CHECK_URL ||
        "https://rc-epay.esewa.com.np/api/epay/transaction/status";
      const params = {
        product_code: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
        total_amount: transaction.amount.toString().replace(/,/g, ""),
        transaction_uuid: transaction.transaction_uuid,
      };

      console.log(`[eSewa Verification] Checking status at ${checkUrl}`);
      console.log(`[eSewa Verification] Params:`, params);

      try {
        const response = await axios.get(checkUrl, { params });
        console.log(`[eSewa Verification] Response Status:`, response.status);
        console.log(
          `[eSewa Verification] Response Data:`,
          JSON.stringify(response.data),
        );

        gatewayResponse = response.data;
        // eSewa returns { status: "COMPLETE", refId: "...", ... }
        const resStatus = response.data.status;
        if (
          resStatus === "COMPLETE" ||
          resStatus === "PASSED" ||
          resStatus === "SUCCESS"
        ) {
          verificationStatus = "COMPLETED";
          transaction.gateway_reference = response.data.refId;
        } else {
          console.log(`[eSewa Verification] Status not complete: ${resStatus}`);
          verificationStatus = "FAILED";
        }
      } catch (err) {
        console.error(
          "eSewa verification failed:",
          err.message,
          err.response?.status,
          err.response?.data,
        );
        verificationStatus = "FAILED";
        gatewayResponse = { error: err.message, details: err.response?.data };
      }
    } else if (transaction.payment_gateway === "khalti") {
      // Verify with Khalti
      const verifyUrl =
        process.env.KHALTI_VERIFICATION_URL ||
        "https://a.khalti.com/api/v2/epayment/lookup/";
      try {
        console.log(`[Khalti Verification] Checking status at ${verifyUrl}`);
        console.log(
          `[Khalti Verification] pidx:`,
          pidx || transaction.gateway_reference,
        );
        const response = await axios.post(
          verifyUrl,
          { pidx: pidx || transaction.gateway_reference },
          {
            headers: {
              Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(`[Khalti Verification] Response:`, response.data);
        gatewayResponse = response.data;
        // Khalti returns { status: "Completed", ... }
        if (response.data.status === "Completed") {
          verificationStatus = "COMPLETED";
        } else if (
          response.data.status === "Expired" ||
          response.data.status === "User canceled"
        ) {
          verificationStatus = "FAILED";
        } else {
          verificationStatus = "PENDING";
        }
      } catch (err) {
        console.error(
          "Khalti verification failed:",
          err.response?.data || err.message,
        );
        verificationStatus = "FAILED";
      }
    }

    console.log(`[Payment Confirmation] Final Status: ${verificationStatus}`);

    // Update Transaction Status
    transaction.status = verificationStatus;
    await transaction.save();

    // Update Appointment Status if Completed
    if (verificationStatus === "COMPLETED") {
      appointment.payment_status = PAYMENT_STATUS.PAID;
      appointment.payment_reference =
        transaction.gateway_reference || transaction.transaction_uuid;
      await appointment.save();

      return successResponse(
        res,
        HTTP_STATUS.OK,
        SUCCESS_MESSAGES.PAYMENT_CONFIRMED,
        {
          status: "COMPLETED",
          transaction,
          appointment,
        },
      );
    } else {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Payment verification failed",
        {
          status: verificationStatus,
          gateway_response: gatewayResponse,
        },
      );
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get payment status for an appointment
 * @route GET /api/payments/status/:appointment_id
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findByPk(appointment_id, {
      attributes: [
        "appointment_id",
        "patient_id",
        "pharmacy_id",
        "doctor_id",
        "payment_status",
        "payment_amount",
        "payment_reference",
        "status",
        "appointment_date",
        "appointment_time",
      ],
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address"],
        },
        {
          model: Doctor,
          required: false,
          include: [{ model: User, attributes: ["full_name"] }],
        },
      ],
    });

    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check permissions
    const isPatient = req.user.id === appointment.patient_id;
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const isDoctor = doctor && doctor.doctor_id === appointment.doctor_id;
    const isAdmin = req.user.role === "Admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to view this payment",
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Payment status retrieved successfully",
      {
        appointment_id: appointment.appointment_id,
        appointment_status: appointment.status,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        payment_status: appointment.payment_status,
        payment_amount: appointment.payment_amount,
        payment_reference: appointment.payment_reference,
        patient: appointment.Patient,
        pharmacy: appointment.Pharmacy,
        doctor: appointment.Doctor,
      },
    );
  } catch (error) {
    console.error("Get payment status error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get payment history for a patient
 * @route GET /api/payments/history/:patient_id
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { limit, offset, page } = getPagination(req.query);
    const { payment_status, date_from, date_to } = req.query;

    // Check permissions
    if (req.user.role !== "Admin" && req.user.id !== parseInt(patient_id, 10)) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only view your own payment history",
      );
    }

    // Build where clause
    const where = {
      patient_id,
      payment_amount: { [Op.not]: null }, // Only include appointments with payment
    };

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (date_from || date_to) {
      where.appointment_date = {};
      if (date_from) where.appointment_date[Op.gte] = date_from;
      if (date_to) where.appointment_date[Op.lte] = date_to;
    }

    const { count, rows: payments } = await Appointment.findAndCountAll({
      where,
      attributes: [
        "appointment_id",
        "appointment_date",
        "appointment_time",
        "status",
        "payment_status",
        "payment_amount",
        "payment_reference",
        "created_at",
      ],
      include: [
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name"],
        },
        {
          model: Doctor,
          required: false,
          include: [{ model: User, attributes: ["full_name"] }],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    // Calculate totals
    const totals = await Appointment.findAll({
      where: {
        patient_id,
        payment_status: PAYMENT_STATUS.PAID,
      },
      attributes: [
        [
          Appointment.sequelize.fn(
            "SUM",
            Appointment.sequelize.col("payment_amount"),
          ),
          "total_paid",
        ],
        [
          Appointment.sequelize.fn(
            "COUNT",
            Appointment.sequelize.col("appointment_id"),
          ),
          "total_payments",
        ],
      ],
      raw: true,
    });

    const response = formatPaginatedResponse(payments, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Payment history retrieved successfully",
      {
        ...response,
        summary: {
          total_paid: parseFloat(totals[0]?.total_paid) || 0,
          total_payments: parseInt(totals[0]?.total_payments, 10) || 0,
        },
      },
    );
  } catch (error) {
    console.error("Get payment history error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Process refund for a cancelled appointment (Admin only)
 * @route POST /api/payments/refund
 */
export const processRefund = async (req, res) => {
  try {
    const { appointment_id, refund_amount, reason } = req.body;

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check if appointment was paid
    if (appointment.payment_status !== PAYMENT_STATUS.PAID) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Cannot refund an appointment that was not paid",
      );
    }

    // Validate refund amount
    const refund = refund_amount || appointment.payment_amount;
    if (refund > appointment.payment_amount) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Refund amount cannot exceed the paid amount",
      );
    }

    // TODO: Process actual refund through payment gateway
    // This is a placeholder for the actual refund logic

    // Update appointment status
    // In a real implementation, you'd have a separate refund tracking table
    appointment.payment_status = "refunded";
    await appointment.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Refund processed successfully",
      {
        appointment_id: appointment.appointment_id,
        refund_amount: refund,
        original_amount: appointment.payment_amount,
        reason: reason || "Not specified",
      },
    );
  } catch (error) {
    console.error("Process refund error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};
