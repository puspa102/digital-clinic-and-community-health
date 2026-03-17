import Pharmacy from "../models/pharmacy.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
  getOtpExpiry,
  generateTempPassword,
} from "../utils/helpers.js";
import { sendCredentialsMail } from "../utils/mail.js";
import {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  APPOINTMENT_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

// ============================================
// ADMIN -> Creates Pharmacy
// ============================================

/**
 * Create a new pharmacy (Admin only)
 * Creates both the User account (role=Pharmacy) and the Pharmacy profile in one go.
 *
 * @route POST /api/pharmacies
 * @access Private (Admin)
 */
export const createPharmacy = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      pharmacy_name,
      address,
      license_number,
      latitude,
      longitude,
      opening_time,
      closing_time,
      description,
    } = req.body;

    // Generate secure temporary password
    const password = generateTempPassword(12);

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.EMAIL_EXISTS,
      );
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return errorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.PHONE_EXISTS,
        );
      }
    }

    // Check if pharmacy license number already exists
    const existingLicense = await Pharmacy.findOne({
      where: { license_number },
    });
    if (existingLicense) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        ERROR_MESSAGES.PHARMACY_LICENSE_EXISTS,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the User with role Pharmacy — admin-created so status = approved
    const user = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role: USER_ROLES.PHARMACY,
      status: USER_STATUS.APPROVED,
      is_verified: true, // Admin-created users are pre-verified
      phone,
      is_temp_password: true, // Flag for password reset on first login
    });

    // Create Pharmacy profile
    const pharmacy = await Pharmacy.create({
      user_id: user.user_id,
      pharmacy_name,
      address,
      license_number,
      phone: phone || null,
      latitude: latitude || null,
      longitude: longitude || null,
      opening_time: opening_time || null,
      closing_time: closing_time || null,
      description: description || null,
    });

    // Fetch complete profile
    const createdPharmacy = await Pharmacy.findByPk(pharmacy.pharmacy_id, {
      include: {
        model: User,
        attributes: [
          "user_id",
          "full_name",
          "email",
          "phone",
          "role",
          "status",
        ],
      },
    });

    // Try to send credentials email to the pharmacy owner (do not block creation on email failure)
    try {
      await sendCredentialsMail(
        user.email,
        password,
        pharmacy.pharmacy_name || user.full_name,
      );
    } catch (mailErr) {
      console.error("Error sending credentials email:", mailErr);
    }

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.PHARMACY_CREATED,
      createdPharmacy,
    );
  } catch (error) {
    console.error("Create pharmacy error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all pharmacies with pagination
 * @route GET /api/pharmacies
 * @access Public
 */
export const getAllPharmacies = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { search, address } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { pharmacy_name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (address) {
      where.address = { [Op.iLike]: `%${address}%` };
    }

    const { count, rows: pharmacies } = await Pharmacy.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["user_id", "full_name", "email", "phone", "status"],
        where: { status: USER_STATUS.APPROVED },
      },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(pharmacies, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Pharmacies retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get all pharmacies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get pharmacy by ID
 * @route GET /api/pharmacies/:id
 * @access Public
 */
export const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone", "status"],
        },
        {
          model: Doctor,
          include: {
            model: User,
            attributes: ["full_name", "email", "phone"],
          },
        },
      ],
    });

    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.PHARMACY_NOT_FOUND,
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Pharmacy retrieved successfully",
      pharmacy,
    );
  } catch (error) {
    console.error("Get pharmacy by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update pharmacy profile
 * @route PUT /api/pharmacies/:id
 * @access Private (Pharmacy owner or Admin)
 */
export const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id, {
      include: { model: User },
    });

    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.PHARMACY_NOT_FOUND,
      );
    }

    // Only the pharmacy owner or admin can update
    if (
      req.user.role !== USER_ROLES.ADMIN &&
      pharmacy.user_id !== req.user.id
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own pharmacy profile",
      );
    }

    const allowedFields = [
      "pharmacy_name",
      "address",
      "license_number",
      "phone",
      "latitude",
      "longitude",
      "opening_time",
      "closing_time",
      "description",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check license uniqueness if being changed
    if (
      updateData.license_number &&
      updateData.license_number !== pharmacy.license_number
    ) {
      const existingLicense = await Pharmacy.findOne({
        where: {
          license_number: updateData.license_number,
          pharmacy_id: { [Op.ne]: pharmacy.pharmacy_id },
        },
      });
      if (existingLicense) {
        return errorResponse(
          res,
          HTTP_STATUS.CONFLICT,
          ERROR_MESSAGES.PHARMACY_LICENSE_EXISTS,
        );
      }
    }

    await pharmacy.update(updateData);

    const updatedPharmacy = await Pharmacy.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ["user_id", "full_name", "email", "phone", "status"],
      },
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PHARMACY_UPDATED,
      updatedPharmacy,
    );
  } catch (error) {
    console.error("Update pharmacy error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Delete pharmacy (Admin only)
 * @route DELETE /api/pharmacies/:id
 * @access Private (Admin)
 */
export const deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByPk(req.params.id);

    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.PHARMACY_NOT_FOUND,
      );
    }

    // Also delete the linked user account
    const user = await User.findByPk(pharmacy.user_id);

    await pharmacy.destroy();
    if (user) {
      await user.destroy();
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PHARMACY_DELETED,
    );
  } catch (error) {
    console.error("Delete pharmacy error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

// ============================================
// PHARMACY -> Creates Doctor
// ============================================

/**
 * Helper: resolve the Pharmacy record for the currently logged-in pharmacy user
 */
const getPharmacyForCurrentUser = async (userId) => {
  return Pharmacy.findOne({ where: { user_id: userId } });
};

/**
 * Create a doctor under the logged-in pharmacy
 * Creates both the User account (role=Doctor) and the Doctor profile, linked to this pharmacy.
 *
 * @route POST /api/pharmacies/doctors
 * @access Private (Pharmacy)
 */
export const createDoctor = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      specialization,
      license_number,
      experience_years,
      hospital_name,
      bio,
      consultation_fee,
      availability_json,
    } = req.body;

    // Generate secure temporary password
    const password = generateTempPassword(12);

    // Resolve the pharmacy for the logged-in user
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found. Please contact admin.",
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.EMAIL_EXISTS,
      );
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return errorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.PHONE_EXISTS,
        );
      }
    }

    // Check if doctor license number already exists
    const existingLicense = await Doctor.findOne({ where: { license_number } });
    if (existingLicense) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "Doctor license number already registered",
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User with role Doctor — pharmacy-created so status = approved
    const user = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role: USER_ROLES.DOCTOR,
      status: USER_STATUS.APPROVED,
      is_verified: true, // Pharmacy-created users are pre-verified
      phone,
      is_temp_password: true, // Flag for password reset on first login
    });

    // Create Doctor profile linked to this pharmacy
    const doctor = await Doctor.create({
      user_id: user.user_id,
      pharmacy_id: pharmacy.pharmacy_id,
      specialization,
      license_number,
      experience_years,
      hospital_name: hospital_name || pharmacy.pharmacy_name,
      bio: bio || null,
      consultation_fee: consultation_fee || null,
      availability_json: availability_json || null,
    });

    // Fetch complete profile
    const createdDoctor = await Doctor.findByPk(doctor.doctor_id, {
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "full_name",
            "email",
            "phone",
            "role",
            "status",
          ],
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name"],
        },
      ],
    });

    // Try to send credentials email to the doctor (do not block creation on email failure)
    try {
      await sendCredentialsMail(user.email, password, user.full_name);
    } catch (mailErr) {
      console.error("Error sending credentials email to doctor:", mailErr);
    }

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.DOCTOR_CREATED_BY_PHARMACY,
      createdDoctor,
    );
  } catch (error) {
    console.error("Pharmacy create doctor error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all doctors belonging to the logged-in pharmacy
 * @route GET /api/pharmacies/my-doctors
 * @access Private (Pharmacy)
 */
export const getMyDoctors = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found.",
      );
    }

    const { limit, offset, page } = getPagination(req.query);
    const { specialization } = req.query;

    const where = { pharmacy_id: pharmacy.pharmacy_id };
    if (specialization) {
      where.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["user_id", "full_name", "email", "phone", "status"],
      },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(doctors, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Pharmacy doctors retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get my doctors error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all doctors belonging to a specific pharmacy (public)
 * @route GET /api/pharmacies/:id/doctors
 * @access Public
 */
export const getPharmacyDoctors = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.PHARMACY_NOT_FOUND,
      );
    }

    const { limit, offset, page } = getPagination(req.query);
    const { specialization } = req.query;

    const where = { pharmacy_id: pharmacyId };
    if (specialization) {
      where.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
        where: { status: USER_STATUS.APPROVED },
      },
      limit,
      offset,
      order: [["experience_years", "DESC"]],
    });

    const response = formatPaginatedResponse(doctors, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      `Doctors for pharmacy '${pharmacy.pharmacy_name}' retrieved successfully`,
      response,
    );
  } catch (error) {
    console.error("Get pharmacy doctors error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

// ============================================
// PHARMACY -> Assigns Doctor to Appointment
// ============================================

/**
 * Assign a doctor to an appointment (Pharmacy only)
 *
 * The patient has booked an appointment at this pharmacy.
 * The pharmacy now picks one of their doctors and assigns them.
 *
 * @route PUT /api/pharmacies/appointments/:appointment_id/assign-doctor
 * @access Private (Pharmacy)
 */
export const assignDoctorToAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { doctor_id } = req.body;

    // Resolve pharmacy for logged-in user
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found.",
      );
    }

    // Find the appointment
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      );
    }

    // Check this appointment belongs to this pharmacy
    if (appointment.pharmacy_id !== pharmacy.pharmacy_id) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        ERROR_MESSAGES.APPOINTMENT_NOT_IN_PHARMACY,
      );
    }

    // Check the appointment is still in 'requested' status
    if (appointment.status !== APPOINTMENT_STATUS.REQUESTED) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot assign a doctor. Appointment is currently '${appointment.status}'. Only 'requested' appointments can be assigned.`,
      );
    }

    // Verify the doctor exists and belongs to this pharmacy
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    if (doctor.pharmacy_id !== pharmacy.pharmacy_id) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        ERROR_MESSAGES.DOCTOR_NOT_IN_PHARMACY,
      );
    }

    // Check for conflicting appointments for this doctor at the same time
    const conflict = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: {
          [Op.notIn]: [
            APPOINTMENT_STATUS.CANCELLED,
            APPOINTMENT_STATUS.NO_SHOW,
          ],
        },
        appointment_id: { [Op.ne]: appointment.appointment_id },
      },
    });

    if (conflict) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "This doctor already has an appointment at that date and time. Please choose another doctor or reschedule.",
      );
    }

    // Assign doctor and move status to 'assigned'
    appointment.doctor_id = doctor_id;
    appointment.status = APPOINTMENT_STATUS.ASSIGNED;
    await appointment.save();

    // Fetch updated appointment with all associations
    const updatedAppointment = await Appointment.findByPk(appointment_id, {
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
        {
          model: Doctor,
          include: {
            model: User,
            attributes: ["full_name", "email", "phone"],
          },
        },
      ],
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.APPOINTMENT_ASSIGNED,
      updatedAppointment,
    );
  } catch (error) {
    console.error("Assign doctor to appointment error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all appointments for the logged-in pharmacy
 * @route GET /api/pharmacies/my-appointments
 * @access Private (Pharmacy)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found.",
      );
    }

    const { limit, offset, page } = getPagination(req.query);
    const { status, date_from, date_to } = req.query;

    const where = { pharmacy_id: pharmacy.pharmacy_id };
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
        ["created_at", "DESC"],
      ],
    });

    const response = formatPaginatedResponse(appointments, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Pharmacy appointments retrieved successfully",
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
 * Get the pharmacy profile for the currently logged-in pharmacy user
 * @route GET /api/pharmacies/me
 * @access Private (Pharmacy)
 */
export const getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone", "status"],
        },
        {
          model: Doctor,
          include: {
            model: User,
            attributes: ["full_name", "email", "phone"],
          },
        },
      ],
    });

    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found.",
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Pharmacy profile retrieved successfully",
      pharmacy,
    );
  } catch (error) {
    console.error("Get my pharmacy error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};
