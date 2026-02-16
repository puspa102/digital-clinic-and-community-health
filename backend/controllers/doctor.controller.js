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
  USER_ROLES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Create doctor profile
 * @route POST /api/doctors/profile
 */
export const createDoctorProfile = async (req, res) => {
  try {
    const {
      user_id,
      specialization,
      license_number,
      experience_years,
      hospital_name,
      bio,
      availability_json,
    } = req.body;

    // Ensure user exists and has doctor role
    const user = await User.findByPk(user_id);
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    if (user.role !== USER_ROLES.DOCTOR) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.INVALID_DOCTOR_USER,
      );
    }

    // Check if doctor profile already exists
    const existingProfile = await Doctor.findOne({ where: { user_id } });
    if (existingProfile) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        ERROR_MESSAGES.DOCTOR_PROFILE_EXISTS,
      );
    }

    // Check if license number is already taken
    const existingLicense = await Doctor.findOne({ where: { license_number } });
    if (existingLicense) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        "License number already registered",
      );
    }

    // Create doctor profile
    const doctor = await Doctor.create({
      user_id,
      specialization,
      license_number,
      experience_years,
      hospital_name,
      bio,
      availability_json,
    });

    // Fetch complete profile with user info
    const completeProfile = await Doctor.findByPk(doctor.doctor_id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
      },
    });

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.PROFILE_CREATED,
      completeProfile,
    );
  } catch (error) {
    console.error("Create doctor profile error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all doctors with pagination
 * @route GET /api/doctors
 */
export const getAllDoctors = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { specialization, hospital, experience_min, experience_max } =
      req.query;

    // Build where clause
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

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
        where: { status: "approved" }, // Only show approved doctors
      },
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
 */
export const searchDoctors = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { q, specialization } = req.query;

    // Build doctor where clause
    const doctorWhere = {};
    if (specialization) {
      doctorWhere.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    // Build user where clause for name search
    const userWhere = { status: "approved" };
    if (q) {
      userWhere[Op.or] = [{ full_name: { [Op.iLike]: `%${q}%` } }];
      // Also search in doctor fields
      doctorWhere[Op.or] = [
        { specialization: { [Op.iLike]: `%${q}%` } },
        { hospital_name: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: q ? { [Op.or]: [doctorWhere, {}] } : doctorWhere,
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
        where: userWhere,
      },
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
 */
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: {
        specialization: { [Op.iLike]: `%${specialization}%` },
      },
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
        where: { status: "approved" },
      },
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
 */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
      },
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
 * Update doctor profile
 * @route PUT /api/doctors/:id
 */
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: { model: User },
    });

    if (!doctor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.DOCTOR_NOT_FOUND,
      );
    }

    // Check ownership (doctor can only update their own profile, unless admin)
    if (req.user.role !== USER_ROLES.ADMIN && doctor.user_id !== req.user.id) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only update your own profile",
      );
    }

    // Filter allowed update fields
    const allowedFields = [
      "specialization",
      "license_number",
      "experience_years",
      "hospital_name",
      "bio",
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

    // Fetch updated profile
    const updatedDoctor = await Doctor.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone", "status"],
      },
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
 * Delete doctor profile (Admin only)
 * @route DELETE /api/doctors/:id
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

    await doctor.destroy();

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
