import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Pharmacy from "../models/pharmacy.model.js";
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
 * Standard includes used when fetching appointments with full associations
 */
const fullAppointmentIncludes = [
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
    include: {
      model: User,
      attributes: ["full_name", "email", "phone"],
    },
  },
];

/**
 * Create a new appointment (Patient books at a Pharmacy)
 *
 * The patient picks a pharmacy and a time slot.
 * doctor_id is NOT required — the pharmacy will assign a doctor later.
 *
 * @route POST /api/appointments
 * @access Private (Patient)
 */
export const createAppointment = async (req, res) => {
  try {
    const { pharmacy_id, appointment_date, appointment_time, reason } = req.body;

    // The patient is the logged-in user
    const patient_id = req.user.id;

    // Verify the logged-in user is actually a patient
    const patient = await User.findByPk(patient_id);
    if (!patient || patient.role !== "Patient") {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Only patients can book appointments",
      );
    }

    // Verify the pharmacy exists and is approved
    const pharmacy = await Pharmacy.findByPk(pharmacy_id, {
      include: {
        model: User,
        attributes: ["status"],
      },
    });

    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.PHARMACY_NOT_FOUND,
      );
    }

    if (pharmacy.User && pharmacy.User.status !== "approved") {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "This pharmacy is not currently available for appointments",
      );
    }

    // Check if this patient already has an active appointment at the same pharmacy/date/time
    const existingAppointment = await Appointment.findOne({
      where: {
        patient_id,
        pharmacy_id,
        appointment_date,
        appointment_time,
        status: {
          [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
        },
      },
    });

    if (existingAppointment) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "You already have an appointment at this pharmacy for the selected date and time.",
      );
    }

    // Create the appointment — no doctor_id yet, pharmacy will assign later
    const appointment = await Appointment.create({
      patient_id,
      pharmacy_id,
      doctor_id: null,
      appointment_date,
      appointment_time,
      reason: reason || null,
      status: APPOINTMENT_STATUS.REQUESTED,
      payment_status: PAYMENT_STATUS.PENDING,
    });

    // Fetch with full associations
    const createdAppointment = await Appointment.findByPk(
      appointment.appointment_id,
      { include: fullAppointmentIncludes },
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
 * @access Private (Admin)
 */
export const getAllAppointments = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status, payment_status, date_from, date_to, pharmacy_id } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (pharmacy_id) where.pharmacy_id = pharmacy_id;
    if (date_from || date_to) {
      where.appointment_date = {};
      if (date_from) where.appointment_date[Op.gte] = date_from;
      if (date_to) where.appointment_date[Op.lte] = date_to;
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: fullAppointmentIncludes,
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
 * @access Private (Patient who owns it, Doctor assigned to it, Pharmacy that owns it, or Admin)
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await Appointment.findByPk(appointment_id, {
      include: fullAppointmentIncludes,
    });

    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check access permissions
    const isAdmin = req.user.role === "Admin";
    const isPatient = req.user.id === appointment.patient_id;

    // Check if the logged-in user is the assigned doctor
    let isAssignedDoctor = false;
    if (appointment.doctor_id) {
      const doctor = await Doctor.findByPk(appointment.doctor_id);
      isAssignedDoctor = doctor && doctor.user_id === req.user.id;
    }

    // Check if the logged-in user is the pharmacy owner
    let isPharmacyOwner = false;
    if (req.user.role === "Pharmacy") {
      const pharmacy = await Pharmacy.findOne({ where: { user_id: req.user.id } });
      isPharmacyOwner = pharmacy && pharmacy.pharmacy_id === appointment.pharmacy_id;
    }

    if (!isPatient && !isAssignedDoctor && !isPharmacyOwner && !isAdmin) {
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
 * Get appointments for the logged-in doctor
 * @route GET /api/appointments/my-doctor-appointments
 * @access Private (Doctor)
 */
export const getMyDoctorAppointments = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status, date_from, date_to } = req.query;

    // Find the doctor record for the logged-in user
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Doctor profile not found for your account",
      );
    }

    // Build where clause
    const where = { doctor_id: doctor.doctor_id };
    if (status) where.status = status;
    if (date_from || date_to) {
      where.appointment_date = {};
      if (date_from) where.appointment_date[Op.gte] = date_from;
      if (date_to) where.appointment_date[Op.lte] = date_to;
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["user_id", "full_name", "email", "phone"],
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address"],
        },
      ],
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
    console.error("Get my doctor appointments error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get appointments by doctor ID (Admin or the doctor themselves)
 * @route GET /api/appointments/doctor/:doctor_id
 * @access Private (Doctor owner, Admin)
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

    // Only the doctor themselves, their pharmacy, or admin can view
    const isAdmin = req.user.role === "Admin";
    const isOwnerDoctor = doctor.user_id === req.user.id;
    let isPharmacyOwner = false;
    if (req.user.role === "Pharmacy") {
      const pharmacy = await Pharmacy.findOne({ where: { user_id: req.user.id } });
      isPharmacyOwner = pharmacy && pharmacy.pharmacy_id === doctor.pharmacy_id;
    }

    if (!isAdmin && !isOwnerDoctor && !isPharmacyOwner) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to view these appointments",
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
      include: [
        {
          model: User,
          as: "Patient",
          attributes: ["user_id", "full_name", "email", "phone"],
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address"],
        },
      ],
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
 * Get appointments for the logged-in patient
 * @route GET /api/appointments/my-appointments
 * @access Private (Patient)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const patient_id = req.user.id;
    const { limit, offset, page } = getPagination(req.query);
    const { status, upcoming } = req.query;

    // Build where clause
    const where = { patient_id };
    if (status) where.status = status;
    if (upcoming === "true") {
      where.appointment_date = { [Op.gte]: new Date() };
      where.status = {
        [Op.in]: [
          APPOINTMENT_STATUS.REQUESTED,
          APPOINTMENT_STATUS.ASSIGNED,
          APPOINTMENT_STATUS.CONFIRMED,
        ],
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
        {
          model: Doctor,
          required: false,
          include: {
            model: User,
            attributes: ["full_name", "email", "phone"],
          },
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
      "Your appointments retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get my appointments error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get appointments by patient ID (Admin only)
 * @route GET /api/appointments/patient/:patient_id
 * @access Private (Admin)
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

    // Only the patient themselves or admin can view
    if (req.user.role !== "Admin" && req.user.id !== parseInt(patient_id, 10)) {
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
        [Op.in]: [
          APPOINTMENT_STATUS.REQUESTED,
          APPOINTMENT_STATUS.ASSIGNED,
          APPOINTMENT_STATUS.CONFIRMED,
        ],
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
        {
          model: Doctor,
          required: false,
          include: {
            model: User,
            attributes: ["full_name", "email", "phone"],
          },
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
 * Update appointment status
 *
 * Allowed transitions:
 *   requested  -> assigned   (pharmacy assigns doctor — handled in pharmacy controller)
 *   assigned   -> confirmed  (doctor accepts)
 *   assigned   -> cancelled  (doctor/pharmacy/patient/admin)
 *   confirmed  -> completed  (doctor marks done)
 *   confirmed  -> cancelled  (doctor/pharmacy/patient/admin)
 *   confirmed  -> no_show    (doctor/pharmacy/admin)
 *
 * @route PUT /api/appointments/:appointment_id/status
 * @access Private (Doctor, Pharmacy, Admin)
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = Object.values(APPOINTMENT_STATUS);
    if (!validStatuses.includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Invalid status value. Must be one of: ${validStatuses.join(", ")}`,
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

    // Define valid transitions
    const validTransitions = {
      [APPOINTMENT_STATUS.REQUESTED]: [APPOINTMENT_STATUS.ASSIGNED, APPOINTMENT_STATUS.CANCELLED],
      [APPOINTMENT_STATUS.ASSIGNED]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELLED],
      [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
      [APPOINTMENT_STATUS.COMPLETED]: [],
      [APPOINTMENT_STATUS.CANCELLED]: [],
      [APPOINTMENT_STATUS.NO_SHOW]: [],
    };

    if (!validTransitions[appointment.status]?.includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot transition from '${appointment.status}' to '${status}'`,
      );
    }

    // Permission checks based on who is making the change
    const isAdmin = req.user.role === "Admin";

    if (!isAdmin) {
      if (req.user.role === "Doctor") {
        // Doctor can only update appointments assigned to them
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || doctor.doctor_id !== appointment.doctor_id) {
          return errorResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "You can only update appointments assigned to you",
          );
        }
        // Doctor can: assigned->confirmed, confirmed->completed, confirmed->no_show, confirmed->cancelled
        const doctorAllowed = [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW, APPOINTMENT_STATUS.CANCELLED];
        if (!doctorAllowed.includes(status)) {
          return errorResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "Doctors can only confirm, complete, mark no-show, or cancel appointments",
          );
        }
      } else if (req.user.role === "Pharmacy") {
        // Pharmacy can update appointments in their pharmacy
        const pharmacy = await Pharmacy.findOne({ where: { user_id: req.user.id } });
        if (!pharmacy || pharmacy.pharmacy_id !== appointment.pharmacy_id) {
          return errorResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "You can only update appointments in your pharmacy",
          );
        }
      } else if (req.user.role === "Patient") {
        // Patient can only cancel their own appointments
        if (req.user.id !== appointment.patient_id) {
          return errorResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "You can only update your own appointments",
          );
        }
        if (status !== APPOINTMENT_STATUS.CANCELLED) {
          return errorResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "Patients can only cancel appointments",
          );
        }
      }
    }

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
 * Doctor confirms an assigned appointment
 * Shorthand for setting status to 'confirmed'
 *
 * @route PUT /api/appointments/:appointment_id/confirm
 * @access Private (Doctor)
 */
export const confirmAppointment = async (req, res) => {
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

    if (appointment.status !== APPOINTMENT_STATUS.ASSIGNED) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Only 'assigned' appointments can be confirmed. Current status: '${appointment.status}'`,
      );
    }

    // Check the doctor is the one assigned
    if (req.user.role !== "Admin") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor || doctor.doctor_id !== appointment.doctor_id) {
        return errorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          "You can only confirm appointments assigned to you",
        );
      }
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(appointment_id, {
      include: fullAppointmentIncludes,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Appointment confirmed successfully",
      updatedAppointment,
    );
  } catch (error) {
    console.error("Confirm appointment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Complete an appointment
 * @route PUT /api/appointments/:appointment_id/complete
 * @access Private (Doctor, Admin)
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

    // Only confirmed appointments can be completed
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
 * Cancel an appointment
 * @route PUT /api/appointments/:appointment_id/cancel
 * @access Private (Patient, Doctor, Pharmacy, Admin)
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

    // Cannot cancel already completed or cancelled appointments
    if (
      appointment.status === APPOINTMENT_STATUS.COMPLETED ||
      appointment.status === APPOINTMENT_STATUS.CANCELLED
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot cancel an appointment that is already '${appointment.status}'`,
      );
    }

    // Permission checks
    const isAdmin = req.user.role === "Admin";
    const isPatient = req.user.id === appointment.patient_id;

    let isAssignedDoctor = false;
    if (appointment.doctor_id) {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      isAssignedDoctor = doctor && doctor.doctor_id === appointment.doctor_id;
    }

    let isPharmacyOwner = false;
    if (req.user.role === "Pharmacy") {
      const pharmacy = await Pharmacy.findOne({ where: { user_id: req.user.id } });
      isPharmacyOwner = pharmacy && pharmacy.pharmacy_id === appointment.pharmacy_id;
    }

    if (!isPatient && !isAssignedDoctor && !isPharmacyOwner && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to cancel this appointment",
      );
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

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