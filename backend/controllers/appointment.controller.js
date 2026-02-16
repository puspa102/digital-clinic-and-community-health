import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Create a new appointment
 * @route POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time } =
      req.body;

    // Verify patient exists
    const patient = await User.findByPk(patient_id);
    if (!patient || patient.role !== "Patient") {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid patient ID or user is not a patient",
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_date,
        appointment_time,
        status: {
          [Op.notIn]: [
            APPOINTMENT_STATUS.CANCELLED,
            APPOINTMENT_STATUS.NO_SHOW,
          ],
        },
      },
    });

    if (existingAppointment) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "This time slot is already booked. Please choose another time.",
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      status: APPOINTMENT_STATUS.REQUESTED,
      payment_status: PAYMENT_STATUS.PENDING,
    });

    // Fetch with associations
    const createdAppointment = await Appointment.findByPk(
      appointment.appointment_id,
      {
        include: [
          { model: User, attributes: ["full_name", "email", "phone"] },
          {
            model: Doctor,
            include: [
              { model: User, attributes: ["full_name", "email", "phone"] },
            ],
          },
        ],
      },
    );

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.APPOINTMENT_CREATED,
      createdAppointment,
    );
  } catch (error) {
    console.error("Create appointment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all appointments (Admin only)
 * @route GET /api/appointments
 */
export const getAllAppointments = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status, payment_status, date_from, date_to } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (date_from || date_to) {
      where.appointment_date = {};
      if (date_from) where.appointment_date[Op.gte] = date_from;
      if (date_to) where.appointment_date[Op.lte] = date_to;
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["full_name", "email", "phone"] },
        {
          model: Doctor,
          include: [
            { model: User, attributes: ["full_name", "email", "phone"] },
          ],
        },
      ],
      limit,
      offset,
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    const response = formatPaginatedResponse(appointments, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Appointments retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get all appointments error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get appointment by ID
 * @route GET /api/appointments/:appointment_id
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: User, attributes: ["full_name", "email", "phone"] },
        {
          model: Doctor,
          include: [
            { model: User, attributes: ["full_name", "email", "phone"] },
          ],
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

    // Check access permissions
    const isPatient = req.user.id === appointment.patient_id;
    const isDoctor = await Doctor.findOne({
      where: { user_id: req.user.id, doctor_id: appointment.doctor_id },
    });
    const isAdmin = req.user.role === "Admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to view this appointment",
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Appointment retrieved successfully",
      appointment,
    );
  } catch (error) {
    console.error("Get appointment by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get appointments by doctor
 * @route GET /api/appointments/doctor/:doctor_id
 */
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { limit, offset, page } = getPagination(req.query);
    const { status, date_from, date_to } = req.query;

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Build where clause
    const where = { doctor_id };
    if (status) where.status = status;
    if (date_from || date_to) {
      where.appointment_date = {};
      if (date_from) where.appointment_date[Op.gte] = date_from;
      if (date_to) where.appointment_date[Op.lte] = date_to;
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [{ model: User, attributes: ["full_name", "email", "phone"] }],
      limit,
      offset,
      order: [
        ["appointment_date", "ASC"],
        ["appointment_time", "ASC"],
      ],
    });

    const response = formatPaginatedResponse(appointments, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Doctor appointments retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get appointments by patient
 * @route GET /api/appointments/patient/:patient_id
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { limit, offset, page } = getPagination(req.query);
    const { status, upcoming } = req.query;

    // Verify patient exists
    const patient = await User.findByPk(patient_id);
    if (!patient) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Check permissions - patient can only view their own appointments
    if (req.user.role !== "Admin" && req.user.id !== parseInt(patient_id)) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only view your own appointments",
      );
    }

    // Build where clause
    const where = { patient_id };
    if (status) where.status = status;
    if (upcoming === "true") {
      where.appointment_date = { [Op.gte]: new Date() };
      where.status = {
        [Op.in]: [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.CONFIRMED],
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Doctor,
          include: [
            { model: User, attributes: ["full_name", "email", "phone"] },
          ],
        },
      ],
      limit,
      offset,
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    const response = formatPaginatedResponse(appointments, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Patient appointments retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get patient appointments error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update appointment status (Doctor accepts/rejects)
 * @route PUT /api/appointments/:appointment_id/status
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid status value",
      );
    }

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check if doctor owns this appointment (unless admin)
    if (req.user.role !== "Admin") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor || doctor.doctor_id !== appointment.doctor_id) {
        return errorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          "You can only update your own appointments",
        );
      }
    }

    // Update status
    const previousStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.APPOINTMENT_UPDATED,
      {
        appointment_id: appointment.appointment_id,
        previous_status: previousStatus,
        new_status: appointment.status,
      },
    );
  } catch (error) {
    console.error("Update appointment status error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Complete appointment
 * @route PUT /api/appointments/:appointment_id/complete
 */
export const completeAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check if appointment is confirmed before completing
    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Only confirmed appointments can be marked as completed",
      );
    }

    // Check if doctor owns this appointment (unless admin)
    if (req.user.role !== "Admin") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor || doctor.doctor_id !== appointment.doctor_id) {
        return errorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          "You can only complete your own appointments",
        );
      }
    }

    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.APPOINTMENT_COMPLETED,
      {
        appointment_id: appointment.appointment_id,
        status: appointment.status,
      },
    );
  } catch (error) {
    console.error("Complete appointment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Cancel appointment
 * @route PUT /api/appointments/:appointment_id/cancel
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check if already completed or cancelled
    if (
      appointment.status === APPOINTMENT_STATUS.COMPLETED ||
      appointment.status === APPOINTMENT_STATUS.CANCELLED
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot cancel an appointment that is already ${appointment.status}`,
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
        "You do not have permission to cancel this appointment",
      );
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    // TODO: Send notification to patient/doctor about cancellation

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Appointment cancelled successfully",
      {
        appointment_id: appointment.appointment_id,
        status: appointment.status,
        cancelled_by: req.user.role,
        reason: reason || null,
      },
    );
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};
