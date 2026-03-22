import Emergency from "../models/emergency.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
  calculateDistance,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  EMERGENCY_STATUS,
  EMERGENCY_TYPES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Create a new emergency request
 * @route POST /api/emergencies
 */
export const createEmergency = async (req, res) => {
  try {
    const { patient_id, emergency_type, description, latitude, longitude } =
      req.body;

    // Use provided patient_id or default to logged-in user
    const effectivePatientId = patient_id || req.user.id;

    // Verify patient exists
    const patient = await User.findByPk(effectivePatientId);
    if (!patient) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Validate emergency type
    if (!Object.values(EMERGENCY_TYPES).includes(emergency_type)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid emergency type. Must be Doctor, Blood, or Medicine.",
      );
    }

    // Prevent duplicate active requests of the same type,
    // but allow different emergency types in parallel.
    const existingEmergency = await Emergency.findOne({
      where: {
        patient_id: effectivePatientId,
        emergency_type,
        status: {
          [Op.in]: [
            EMERGENCY_STATUS.PENDING,
            EMERGENCY_STATUS.ACCEPTED,
            EMERGENCY_STATUS.IN_PROGRESS,
          ],
        },
      },
    });

    if (existingEmergency) {
      return errorResponse(
        res,
        HTTP_STATUS.CONFLICT,
        `You already have an active ${emergency_type} emergency request. Please wait for it to be resolved or cancel it first.`,
      );
    }

    // Create emergency with optional coordinates (default to 0,0 if not provided)
    const emergency = await Emergency.create({
      patient_id: effectivePatientId,
      emergency_type,
      description,
      latitude: latitude || 0,
      longitude: longitude || 0,
      status: EMERGENCY_STATUS.PENDING,
      priority: "HIGH",
    });

    // Fetch with patient info
    const createdEmergency = await Emergency.findByPk(emergency.emergency_id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
    });

    // TODO: Send notifications to nearby doctors/pharmacies
    const io = req.app.get("io");
    if (io) {
      io.emit("new_emergency", createdEmergency);
    }

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      SUCCESS_MESSAGES.EMERGENCY_CREATED,
      createdEmergency,
    );
  } catch (error) {
    console.error("Create emergency error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all emergencies with pagination and filters
 * @route GET /api/emergencies
 */
export const getAllEmergencies = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status, type, priority, date_from, date_to } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (type) where.emergency_type = type;
    if (priority) where.priority = priority;
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) where.created_at[Op.lte] = new Date(date_to);
    }

    const { count, rows: emergencies } = await Emergency.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
      limit,
      offset,
      order: [
        ["priority", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    const response = formatPaginatedResponse(emergencies, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Emergencies retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get all emergencies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get current user's emergencies
 * @route GET /api/emergencies/my-emergencies
 */
export const getMyEmergencies = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status } = req.query;

    // Build where clause for user's emergencies
    const where = { patient_id: req.user.id };
    if (status) where.status = status;

    const { count, rows: emergencies } = await Emergency.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(emergencies, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Your emergencies retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get my emergencies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get all public emergencies (viewable by all authenticated users)
 * @route GET /api/emergencies/public
 */
export const getPublicEmergencies = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { type } = req.query;

    // Only show pending emergencies publicly
    const where = {
      status: {
        [Op.in]: [EMERGENCY_STATUS.PENDING, EMERGENCY_STATUS.ACCEPTED],
      },
    };
    if (type) where.emergency_type = type;

    const { count, rows: emergencies } = await Emergency.findAndCountAll({
      where,
      include: {
        model: User,
        attributes: ["full_name", "phone"],
      },
      limit,
      offset,
      order: [
        ["priority", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    const response = formatPaginatedResponse(emergencies, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Public emergencies retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get public emergencies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get active emergencies (pending, accepted, in_progress)
 * @route GET /api/emergencies/active
 */
export const getActiveEmergencies = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);

    const { count, rows: emergencies } = await Emergency.findAndCountAll({
      where: {
        status: {
          [Op.in]: [
            EMERGENCY_STATUS.PENDING,
            EMERGENCY_STATUS.ACCEPTED,
            EMERGENCY_STATUS.IN_PROGRESS,
          ],
        },
      },
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
      limit,
      offset,
      order: [
        ["priority", "DESC"],
        ["created_at", "ASC"], // Oldest first for active emergencies
      ],
    });

    const response = formatPaginatedResponse(emergencies, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Active emergencies retrieved successfully",
      response,
    );
  } catch (error) {
    console.error("Get active emergencies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get nearby emergencies within a specified radius
 * @route GET /api/emergencies/nearby
 */
export const getNearbyEmergencies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Latitude and longitude are required",
      );
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Get all pending emergencies
    const emergencies = await Emergency.findAll({
      where: {
        status: EMERGENCY_STATUS.PENDING,
      },
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
      order: [
        ["priority", "DESC"],
        ["created_at", "ASC"],
      ],
    });

    // Filter by distance and add distance info
    const nearbyEmergencies = emergencies
      .map((emergency) => {
        const distance = calculateDistance(
          lat,
          lon,
          parseFloat(emergency.latitude),
          parseFloat(emergency.longitude),
        );
        return {
          ...emergency.toJSON(),
          distance_km: Math.round(distance * 100) / 100,
        };
      })
      .filter((emergency) => emergency.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      `Found ${nearbyEmergencies.length} emergencies within ${radiusKm}km`,
      nearbyEmergencies,
    );
  } catch (error) {
    console.error("Get nearby emergencies error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Get emergency by ID
 * @route GET /api/emergencies/:id
 */
export const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
    });

    if (!emergency) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.EMERGENCY_NOT_FOUND,
      );
    }

    // Check permissions
    const isPatient = req.user.id === emergency.patient_id;
    const isAcceptor = emergency.accepted_by === req.user.id;
    const isAdmin = req.user.role === "Admin";
    const isAuthorizedRole = ["Doctor", "Pharmacy"].includes(req.user.role);

    if (!isPatient && !isAcceptor && !isAdmin && !isAuthorizedRole) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to view this emergency",
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Emergency retrieved successfully",
      emergency,
    );
  } catch (error) {
    console.error("Get emergency by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Accept an emergency request
 * @route PUT /api/emergencies/:emergency_id/accept
 */
export const acceptEmergency = async (req, res) => {
  try {
    const { emergency_id } = req.params;
    const { accepted_by } = req.body;

    const emergency = await Emergency.findByPk(emergency_id);

    if (!emergency) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.EMERGENCY_NOT_FOUND,
      );
    }

    // Check if already accepted
    if (emergency.status !== EMERGENCY_STATUS.PENDING) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGES.EMERGENCY_ALREADY_ACCEPTED,
      );
    }

    // Verify acceptor exists
    const acceptor = await User.findByPk(accepted_by || req.user.id);
    if (!acceptor) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Acceptor user not found",
      );
    }

    // Update emergency
    emergency.status = EMERGENCY_STATUS.ACCEPTED;
    emergency.accepted_by = accepted_by || req.user.id;
    await emergency.save();

    // Fetch updated emergency with associations
    const updatedEmergency = await Emergency.findByPk(emergency_id, {
      include: {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
    });

    // Get acceptor details
    const acceptorDetails = await User.findByPk(emergency.accepted_by, {
      attributes: ["user_id", "full_name", "email", "phone", "role"],
    });

    // TODO: Send notification to patient

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.EMERGENCY_ACCEPTED,
      {
        emergency: updatedEmergency,
        accepted_by: acceptorDetails,
      },
    );
  } catch (error) {
    console.error("Accept emergency error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Update emergency status
 * @route PUT /api/emergencies/:id/status
 */
export const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!Object.values(EMERGENCY_STATUS).includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Invalid status value. Must be pending, accepted, in_progress, resolved, or expired.",
      );
    }

    const emergency = await Emergency.findByPk(req.params.id);

    if (!emergency) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.EMERGENCY_NOT_FOUND,
      );
    }

    // Check permissions - only acceptor or admin can update status
    const isAcceptor = emergency.accepted_by === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isAcceptor && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Only the person who accepted this emergency or an admin can update its status",
      );
    }

    // Validate status transitions
    const validTransitions = {
      [EMERGENCY_STATUS.PENDING]: [
        EMERGENCY_STATUS.ACCEPTED,
        EMERGENCY_STATUS.EXPIRED,
      ],
      [EMERGENCY_STATUS.ACCEPTED]: [
        EMERGENCY_STATUS.IN_PROGRESS,
        EMERGENCY_STATUS.RESOLVED,
      ],
      [EMERGENCY_STATUS.IN_PROGRESS]: [EMERGENCY_STATUS.RESOLVED],
      [EMERGENCY_STATUS.RESOLVED]: [],
      [EMERGENCY_STATUS.EXPIRED]: [],
    };

    if (!validTransitions[emergency.status].includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot transition from '${emergency.status}' to '${status}'`,
      );
    }

    const previousStatus = emergency.status;
    emergency.status = status;
    await emergency.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      SUCCESS_MESSAGES.EMERGENCY_UPDATED,
      {
        emergency_id: emergency.emergency_id,
        previous_status: previousStatus,
        new_status: emergency.status,
      },
    );
  } catch (error) {
    console.error("Update emergency status error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Resolve an emergency
 * @route PUT /api/emergencies/:id/resolve
 */
export const resolveEmergency = async (req, res) => {
  try {
    const { resolution_notes } = req.body;

    const emergency = await Emergency.findByPk(req.params.id);

    if (!emergency) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.EMERGENCY_NOT_FOUND,
      );
    }

    // Check if can be resolved
    if (
      emergency.status === EMERGENCY_STATUS.RESOLVED ||
      emergency.status === EMERGENCY_STATUS.EXPIRED
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Emergency is already ${emergency.status}`,
      );
    }

    // Check permissions
    const isAcceptor = emergency.accepted_by === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isAcceptor && !isAdmin) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Only the person who accepted this emergency or an admin can resolve it",
      );
    }

    emergency.status = EMERGENCY_STATUS.RESOLVED;
    await emergency.save();

    // TODO: Send notification to patient about resolution

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Emergency resolved successfully",
      {
        emergency_id: emergency.emergency_id,
        status: emergency.status,
        resolved_by: req.user.id,
        resolution_notes: resolution_notes || null,
      },
    );
  } catch (error) {
    console.error("Resolve emergency error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};

/**
 * Cancel own emergency request (Patient only)
 * @route PUT /api/emergencies/:id/cancel
 */
export const cancelEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByPk(req.params.id);

    if (!emergency) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        ERROR_MESSAGES.EMERGENCY_NOT_FOUND,
      );
    }

    // Check if user owns this emergency
    if (emergency.patient_id !== req.user.id && req.user.role !== "Admin") {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only cancel your own emergency requests",
      );
    }

    // Check if can be cancelled
    if (
      emergency.status === EMERGENCY_STATUS.RESOLVED ||
      emergency.status === EMERGENCY_STATUS.EXPIRED
    ) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Cannot cancel emergency that is already ${emergency.status}`,
      );
    }

    const previousStatus = emergency.status;
    emergency.status = EMERGENCY_STATUS.EXPIRED;
    await emergency.save();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Emergency request cancelled successfully",
      {
        emergency_id: emergency.emergency_id,
        previous_status: previousStatus,
        new_status: emergency.status,
      },
    );
  } catch (error) {
    console.error("Cancel emergency error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
};
