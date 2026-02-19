import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import Doctor from "../models/doctor.model.js";
import { Op } from "sequelize";
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
 * Initiate payment for an appointment
 * @route POST /api/payments/initiate
 */
export const initiatePayment = async (req, res) => {
  try {
    const { appointment_id, amount, payment_method = "esewa" } = req.body;

    // Find appointment
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: User, as: "Patient", attributes: ["user_id", "full_name", "email", "phone"] },
        { model: Pharmacy, attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"] },
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

    // Check if user has permission (must be the patient or admin)
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

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${generateRandomString(8)}`;

    // Build payment URL based on payment method
    let paymentUrl;
    const baseCallbackUrl =
      process.env.PAYMENT_CALLBACK_URL ||
      "http://localhost:5000/api/payments/confirm";

    if (payment_method === "esewa") {
      // eSewa payment integration (simplified for demo)
      const esewaParams = new URLSearchParams({
        amt: amount,
        pdc: 0, // Delivery charge
        psc: 0, // Service charge
        txAmt: 0, // Tax amount
        tAmt: amount, // Total amount
        pid: transactionId,
        scd: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
        su: `${baseCallbackUrl}?status=success`,
        fu: `${baseCallbackUrl}?status=failed`,
      });

      const esewaBaseUrl =
        process.env.ESEWA_TEST_MODE !== "false"
          ? "https://uat.esewa.com.np/epay/main"
          : "https://esewa.com.np/epay/main";

      paymentUrl = `${esewaBaseUrl}?${esewaParams.toString()}`;
    } else if (payment_method === "khalti") {
      // Khalti payment integration (simplified for demo)
      paymentUrl = `https://khalti.com/api/v2/payment/initiate/?amount=${amount * 100}&appointment_id=${appointment_id}&transaction_id=${transactionId}`;
    } else {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid payment method. Supported methods: esewa, khalti",
      );
    }

    // Update appointment with payment info
    appointment.payment_amount = amount;
    appointment.payment_status = PAYMENT_STATUS.PENDING;
    appointment.payment_reference = transactionId;
    await appointment.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PAYMENT_INITIATED,
      {
        appointment_id: appointment.appointment_id,
        transaction_id: transactionId,
        amount,
        payment_method,
        payment_url: paymentUrl,
        payment_status: appointment.payment_status,
      },
    );
  } catch (error) {
    console.error("Initiate payment error:", error);
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
    const { appointment_id, payment_id, status, transaction_code } = req.body;

    // Find appointment
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Verify payment status
    if (status === "success") {
      // In production, verify with payment gateway API
      // For eSewa: verify with their verification endpoint
      // For Khalti: verify with their verification endpoint

      // Update appointment payment status
      appointment.payment_status = PAYMENT_STATUS.PAID;
      appointment.payment_reference =
        payment_id || appointment.payment_reference;

      // Optionally store transaction code for reference
      // You might want to add a payment_transaction_code field to the model
    } else {
      appointment.payment_status = PAYMENT_STATUS.FAILED;
    }

    await appointment.save();

    // Fetch updated appointment with associations
    const updatedAppointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: User, as: "Patient", attributes: ["user_id", "full_name", "email", "phone"] },
        { model: Pharmacy, attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"] },
        {
          model: Doctor,
          required: false,
          include: [{ model: User, attributes: ["full_name"] }],
        },
      ],
    });

    // TODO: Send notification to patient about payment status
    // TODO: Send notification to doctor if payment successful

    return successResponse(
      res,
      HTTP_STATUS.OK,
      appointment.payment_status === PAYMENT_STATUS.PAID
        ? SUCCESS_MESSAGES.PAYMENT_CONFIRMED
        : "Payment failed. Please try again.",
      {
        appointment_id: updatedAppointment.appointment_id,
        payment_status: updatedAppointment.payment_status,
        payment_amount: updatedAppointment.payment_amount,
        payment_reference: updatedAppointment.payment_reference,
      },
    );
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
        { model: User, as: "Patient", attributes: ["user_id", "full_name", "email"] },
        { model: Pharmacy, attributes: ["pharmacy_id", "pharmacy_name", "address"] },
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
