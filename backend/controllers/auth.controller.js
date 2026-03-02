import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
  generateOtp,
  getOtpExpiry,
  isOtpExpired,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  JWT_CONFIG,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";
import { otpMail } from "../utils/mail.js";

dotenv.config();

/**
 * Register a new user (PUBLIC — Patient only)
 *
 * Pharmacies are created by Admin.
 * Doctors are created by Pharmacies.
 * This endpoint is exclusively for normal patients.
 *
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // ------------------------------------------------------------------
    // Public registration is ONLY for patients.
    // If someone tries to pass role=Doctor / Pharmacy / Admin we reject.
    // ------------------------------------------------------------------
    if (req.body.role && req.body.role !== USER_ROLES.PATIENT) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        ERROR_MESSAGES.ONLY_PATIENT_REGISTRATION,
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.EMAIL_EXISTS,
        );
      }
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.PHONE_EXISTS,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOtp();
    const otp_expiry = getOtpExpiry(5);

    // Create patient user — role is always Patient, status is approved
    // is_verified stays false until OTP is verified
    const user = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      role: USER_ROLES.PATIENT,
      status: USER_STATUS.APPROVED,
      is_verified: false,
      otp,
      otp_expiry,
      phone,
    });

    // TODO: Send OTP via email/SMS
    await otpMail(email, otp);
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.USER_REGISTERED,
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Verify OTP for account activation
 * @route POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Check OTP validity
    if (user.otp !== otp || isOtpExpired(user.otp_expiry)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.INVALID_OTP,
      );
    }

    // Clear OTP and mark account as verified
    user.otp = null;
    user.otp_expiry = null;
    user.is_verified = true;

    if (user.role === USER_ROLES.PATIENT) {
      user.status = USER_STATUS.APPROVED;
    }

    await user.save();

    return successResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.OTP_VERIFIED, {
      status: user.status,
      role: user.role,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Resend OTP
 * @route POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Email is required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Generate new OTP
    const otp = generateOtp();
    const otp_expiry = getOtpExpiry(5);

    user.otp = otp;
    user.otp_expiry = otp_expiry;
    await user.save();

    // TODO: Send OTP via email/SMS
    console.log(`[DEV] New OTP for ${email}: ${otp}`);

    return successResponse(res, HTTP_STATUS.OK, "OTP sent successfully", {
      email: user.email,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // Check user status
    if (user.status === USER_STATUS.BLOCKED) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Your account has been blocked. Please contact support.",
      );
    }

    if (user.status === USER_STATUS.PENDING) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Your account is pending approval. Please wait for admin verification.",
      );
    }

    // Check if email is verified (OTP completed)
    if (!user.is_verified) {
      // Resend OTP so the user can verify
      const otp = generateOtp();
      const otp_expiry = getOtpExpiry(5);
      user.otp = otp;
      user.otp_expiry = otp_expiry;
      await user.save();

      // Send OTP email
      await otpMail(user.email, otp);
      console.log(`[DEV] OTP for ${user.email}: ${otp}`);

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        code: "EMAIL_NOT_VERIFIED",
        data: { email: user.email },
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY },
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY },
    );

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: JWT_CONFIG.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.LOGIN_SUCCESS,
      {
        accessToken,
        user: {
          id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          is_temp_password: user.is_temp_password || false,
        },
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Refresh access token
 * @route GET /api/auth/refresh-token
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "No refresh token provided",
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Get user to include role in new token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "User not found");
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Account has been blocked",
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY },
    );

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Token refreshed successfully",
      {
        accessToken: newAccessToken,
      },
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    );
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "otp", "otp_expiry"] },
    });

    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Profile retrieved successfully",
      user,
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update current user profile
 * @route PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Check if phone is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        where: { phone, user_id: { [Op.ne]: user.user_id } },
      });
      if (existingPhone) {
        return errorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.PHONE_EXISTS,
        );
      }
    }

    // Update fields
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "otp", "otp_expiry"] },
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.PROFILE_UPDATED,
      updatedUser,
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Current password and new password are required",
      );
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Current password is incorrect",
      );
    }

    // Hash and save new password
    user.password_hash = await bcrypt.hash(new_password, 12);
    // Reset temp password flag if it was set
    if (user.is_temp_password) {
      user.is_temp_password = false;
    }
    await user.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Password changed successfully",
    );
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all users (Admin only)
 * @route GET /api/auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { role, status, search } = req.query;

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password_hash", "otp", "otp_expiry"] },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(users, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Users retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get all users error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get user by ID (Admin only)
 * @route GET /api/auth/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash", "otp", "otp_expiry"] },
    });

    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "User retrieved successfully",
      user,
    );
  } catch (error) {
    console.error("Get user by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update user status (Admin only)
 * @route PUT /api/auth/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(USER_STATUS).includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid status value",
      );
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    user.status = status;
    await user.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      `User status updated to ${status}`,
      {
        user_id: user.user_id,
        status: user.status,
      },
    );
  } catch (error) {
    console.error("Update user status error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Delete user (Admin only)
 * @route DELETE /api/auth/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Prevent self-deletion
    if (user.user_id === req.user.id) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "You cannot delete your own account",
      );
    }

    await user.destroy();

    return successResponse(res, HTTP_STATUS.OK, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};
