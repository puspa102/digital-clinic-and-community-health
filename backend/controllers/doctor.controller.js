import Doctor from "../models/doctor.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Standard includes used when fetching doctors with full associations
 */
const fullDoctorIncludes = [
  {
    model: User,
    attributes: ["user_id", "full_name", "email", "phone", "status"],
  },
  {
    model: Pharmacy,
    attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
  },
];

/**
 * Get all doctors with pagination
 *
 * Public endpoint — only shows doctors whose User status is approved.
 *
 * @route GET /api/doctors
 * @access Public
 */
export const getAllDoctors = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const {
      specialization,
      hospital,
      experience_min,
      experience_max,
      pharmacy_id,
    } = req.query;

    // Build where clause for Doctor
    const where = {};
    if (specialization) {
      where.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    if (hospital) {
      where.hospital_name = { [Op.iLike]: `%${hospital}%` };
    }
    if (experience_min) {
      where.experience_years = { [Op.gte]: parseInt(experience_min, 10) };
    }
    if (experience_max) {
      where.experience_years = {
        ...where.experience_years,
        [Op.lte]: parseInt(experience_max, 10),
      };
    }
    if (pharmacy_id) {
      where.pharmacy_id = parseInt(pharmacy_id, 10);
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone", "status"],
          where: { status: USER_STATUS.APPROVED }, // Only show approved doctors
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(doctors, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Doctors retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get all doctors error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Search doctors by name, specialization, or hospital
 * @route GET /api/doctors/search
 * @access Public
 */
export const searchDoctors = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { q, specialization, pharmacy_id } = req.query;

    // Build doctor where clause
    const doctorWhere = {};
    if (specialization) {
      doctorWhere.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    if (pharmacy_id) {
      doctorWhere.pharmacy_id = parseInt(pharmacy_id, 10);
    }

    // Build user where clause for name search
    const userWhere = { status: USER_STATUS.APPROVED };

    if (q) {
      // Search across doctor fields and user name
      userWhere[Op.or] = [{ full_name: { [Op.iLike]: `%${q}%` } }];

      if (!specialization) {
        doctorWhere[Op.or] = [
          { specialization: { [Op.iLike]: `%${q}%` } },
          { hospital_name: { [Op.iLike]: `%${q}%` } },
        ];
      }
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: doctorWhere,
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone", "status"],
          where: userWhere,
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
      ],
      limit,
      offset,
      order: [["experience_years", "DESC"]],
    });

    const response = formatPaginatedResponse(doctors, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Search results retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Search doctors error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get doctors by specialization
 * @route GET /api/doctors/specialization/:specialization
 * @access Public
 */
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: {
        specialization: { [Op.iLike]: `%${specialization}%` },
      },
      include: [
        {
          model: User,
          attributes: ["user_id", "full_name", "email", "phone", "status"],
          where: { status: USER_STATUS.APPROVED },
        },
        {
          model: Pharmacy,
          attributes: ["pharmacy_id", "pharmacy_name", "address", "phone"],
        },
      ],
      limit,
      offset,
      order: [["experience_years", "DESC"]],
    });

    const response = formatPaginatedResponse(doctors, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      `Doctors with specialization '${specialization}' retrieved`,
      response,
    );
  } catch (error) {
    console.error("Get doctors by specialization error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get doctor by ID
 * @route GET /api/doctors/:id
 * @access Public
 */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: fullDoctorIncludes,
    });

    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Doctor retrieved successfully",
      doctor,
    );
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get the profile of the currently logged-in doctor
 * @route GET /api/doctors/me
 * @access Private (Doctor)
 */
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: { user_id: req.user.id },
      include: fullDoctorIncludes,
    });

    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Doctor profile not found for your account",
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Doctor profile retrieved successfully",
      doctor,
    );
  } catch (error) {
    console.error("Get my doctor profile error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update doctor profile
 *
 * The doctor themselves, their parent pharmacy, or an admin can update.
 * NOTE: Doctors are created by pharmacies (via POST /api/pharmacies/doctors),
 * so there is no self-creation endpoint here.
 *
 * @route PUT /api/doctors/:id
 * @access Private (Doctor owner, Pharmacy owner, Admin)
 */
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User }, { model: Pharmacy }],
    });

    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Permission: the doctor themselves, the pharmacy that owns them, or admin
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const isDoctorOwner = doctor.user_id === req.user.id;

    let isPharmacyOwner = false;
    if (req.user.role === USER_ROLES.PHARMACY) {
      const pharmacy = await Pharmacy.findOne({
        where: { user_id: req.user.id },
      });
      isPharmacyOwner =
        pharmacy && pharmacy.pharmacy_id === doctor.pharmacy_id;
    }

    if (!isDoctorOwner && !isPharmacyOwner && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own profile, or a doctor in your pharmacy",
      );
    }

    // Filter allowed update fields
    const allowedFields = [
      "specialization",
      "license_number",
      "experience_years",
      "hospital_name",
      "bio",
      "consultation_fee",
      "availability_json",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check if license number is being changed and if it's already taken
    if (
      updateData.license_number &&
      updateData.license_number !== doctor.license_number
    ) {
      const existingLicense = await Doctor.findOne({
        where: {
          license_number: updateData.license_number,
          doctor_id: { [Op.ne]: doctor.doctor_id },
        },
      });
      if (existingLicense) {
        return errorResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "License number already registered",
        );
      }
    }

    await doctor.update(updateData);

    // Fetch updated profile with full includes
    const updatedDoctor = await Doctor.findByPk(req.params.id, {
      include: fullDoctorIncludes,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PROFILE_UPDATED,
      updatedDoctor,
    );
  } catch (error) {
    console.error("Update doctor error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Delete doctor profile
 *
 * Only the parent pharmacy or an admin can delete a doctor.
 *
 * @route DELETE /api/doctors/:id
 * @access Private (Pharmacy owner, Admin)
 */
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Permission: the pharmacy that owns the doctor, or admin
    const isAdmin = req.user.role === USER_ROLES.ADMIN;

    let isPharmacyOwner = false;
    if (req.user.role === USER_ROLES.PHARMACY) {
      const pharmacy = await Pharmacy.findOne({
        where: { user_id: req.user.id },
      });
      isPharmacyOwner =
        pharmacy && pharmacy.pharmacy_id === doctor.pharmacy_id;
    }

    if (!isPharmacyOwner && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Only the parent pharmacy or an admin can delete a doctor",
      );
    }

    // Also delete the associated user account
    const user = await User.findByPk(doctor.user_id);

    await doctor.destroy();
    if (user) {
      await user.destroy();
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PROFILE_DELETED,
    );
  } catch (error) {
    console.error("Delete doctor error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get patients for the logged-in doctor
 * Returns only patients who have had appointments with this doctor
 *
 * @route GET /api/doctors/my-patients
 * @access Private (Doctor)
 */
export const getMyPatients = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { search } = req.query;

    // First, get the doctor profile for the logged-in user
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Get unique patient IDs from appointments with this doctor
    const appointments = await Appointment.findAll({
      where: { doctor_id: doctor.doctor_id },
      attributes: ["patient_id"],
      group: ["patient_id"],
    });

    const patientIds = appointments.map((apt) => apt.patient_id);

    if (patientIds.length === 0) {
      return successResponse(
        res,
        HTTP_STATUS.OK,
        "Patients retrieved successfully",
        formatPaginatedResponse([], 0, page, limit),
      );
    }

    // Build where clause for patients
    const where = {
      user_id: { [Op.in]: patientIds },
      role: USER_ROLES.PATIENT,
    };

    // Add search filter if provided
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get paginated patients
    const { count, rows: patients } = await User.findAndCountAll({
      where,
      attributes: ["user_id", "full_name", "email", "phone", "status", "created_at"],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(patients, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Patients retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get my patients error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};