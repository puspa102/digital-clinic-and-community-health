import { Prescription, PrescriptionItem } from "../models/prescription.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";
import {
  getPagination,
  formatPaginatedResponse,
  successResponse,
  errorResponse,
} from "../utils/helpers.js";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../utils/constants.js";

/**
 * Standard includes for prescription queries
 */
const prescriptionIncludes = [
  {
    model: Doctor,
    attributes: ["doctor_id", "specialization", "hospital_name"],
    include: [
      {
        model: User,
        attributes: ["full_name", "email", "phone"],
      },
    ],
  },
  {
    model: User,
    as: "Patient",
    attributes: ["user_id", "full_name", "email", "phone"],
  },
  {
    model: Appointment,
    attributes: ["appointment_id", "appointment_date", "appointment_time", "status"],
    required: false,
  },
  {
    model: PrescriptionItem,
  },
];

/**
 * Get prescriptions for the logged-in doctor
 * @route GET /api/prescriptions/my-prescriptions
 * @access Private (Doctor)
 */
export const getMyPrescriptions = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { status, search, patient_id } = req.query;

    // Find doctor record for current user
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Doctor profile not found");
    }

    const where = { doctor_id: doctor.doctor_id };

    if (status) {
      where.status = status;
    }
    if (patient_id) {
      where.patient_id = parseInt(patient_id);
    }

    // Build search conditions
    const includeWithSearch = [...prescriptionIncludes];
    if (search) {
      // Search by diagnosis or patient name
      where[Op.or] = [
        { diagnosis: { [Op.iLike]: `%${search}%` } },
      ];
      // Also search by patient name via include
      includeWithSearch[1] = {
        model: User,
        as: "Patient",
        attributes: ["user_id", "full_name", "email", "phone"],
        where: {
          [Op.or]: [
            { full_name: { [Op.iLike]: `%${search}%` } },
          ],
        },
        required: false,
      };
    }

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      include: includeWithSearch,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    const response = formatPaginatedResponse(prescriptions, count, page, limit);
    return successResponse(res, HTTP_STATUS.OK, "Prescriptions retrieved successfully", response);
  } catch (error) {
    console.error("Get my prescriptions error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get a single prescription by ID
 * @route GET /api/prescriptions/:id
 * @access Private (Doctor, Patient who owns it, Admin)
 */
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: prescriptionIncludes,
    });

    if (!prescription) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Prescription not found");
    }

    // Check permissions: doctor who created it, patient it belongs to, or admin
    const isAdmin = req.user.role === "Admin";
    const isPatient = prescription.patient_id === req.user.id;
    let isDoctor = false;
    if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      isDoctor = doctor && doctor.doctor_id === prescription.doctor_id;
    }

    if (!isAdmin && !isPatient && !isDoctor) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return successResponse(res, HTTP_STATUS.OK, "Prescription retrieved successfully", prescription);
  } catch (error) {
    console.error("Get prescription by ID error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Create a new prescription
 * @route POST /api/prescriptions
 * @access Private (Doctor)
 */
export const createPrescription = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { patient_id, appointment_id, diagnosis, notes, items } = req.body;

    // Find doctor record for current user
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      await transaction.rollback();
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Doctor profile not found");
    }

    // Verify patient exists
    const patient = await User.findOne({
      where: { user_id: patient_id, role: "Patient" },
    });
    if (!patient) {
      await transaction.rollback();
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Patient not found");
    }

    // Verify appointment if provided
    if (appointment_id) {
      const appointment = await Appointment.findOne({
        where: {
          appointment_id,
          doctor_id: doctor.doctor_id,
          patient_id,
        },
      });
      if (!appointment) {
        await transaction.rollback();
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Appointment not found or does not match doctor/patient");
      }
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "At least one prescription item is required");
    }

    // Create prescription
    const prescription = await Prescription.create(
      {
        doctor_id: doctor.doctor_id,
        patient_id,
        appointment_id: appointment_id || null,
        diagnosis,
        notes: notes || null,
        status: "active",
      },
      { transaction }
    );

    // Create prescription items
    const prescriptionItems = items.map((item) => ({
      prescription_id: prescription.prescription_id,
      medicine_name: item.medicine_name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantity: item.quantity || null,
      instructions: item.instructions || null,
    }));

    await PrescriptionItem.bulkCreate(prescriptionItems, { transaction });

    await transaction.commit();

    // Fetch the full prescription with includes
    const fullPrescription = await Prescription.findByPk(prescription.prescription_id, {
      include: prescriptionIncludes,
    });

    return successResponse(res, HTTP_STATUS.CREATED, "Prescription created successfully", fullPrescription);
  } catch (error) {
    await transaction.rollback();
    console.error("Create prescription error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Update a prescription
 * @route PUT /api/prescriptions/:id
 * @access Private (Doctor who created it)
 */
export const updatePrescription = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) {
      await transaction.rollback();
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Prescription not found");
    }

    // Only the doctor who created it can update
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor || doctor.doctor_id !== prescription.doctor_id) {
      await transaction.rollback();
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You can only update your own prescriptions");
    }

    const { diagnosis, notes, status, items } = req.body;

    // Update prescription fields
    const updateData = {};
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date();

    await prescription.update(updateData, { transaction });

    // If items are provided, replace all items
    if (items && Array.isArray(items) && items.length > 0) {
      await PrescriptionItem.destroy({
        where: { prescription_id: prescription.prescription_id },
        transaction,
      });

      const newItems = items.map((item) => ({
        prescription_id: prescription.prescription_id,
        medicine_name: item.medicine_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity || null,
        instructions: item.instructions || null,
      }));

      await PrescriptionItem.bulkCreate(newItems, { transaction });
    }

    await transaction.commit();

    const updatedPrescription = await Prescription.findByPk(prescription.prescription_id, {
      include: prescriptionIncludes,
    });

    return successResponse(res, HTTP_STATUS.OK, "Prescription updated successfully", updatedPrescription);
  } catch (error) {
    await transaction.rollback();
    console.error("Update prescription error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Delete a prescription
 * @route DELETE /api/prescriptions/:id
 * @access Private (Doctor who created it, Admin)
 */
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Prescription not found");
    }

    // Only the doctor who created it or admin can delete
    const isAdmin = req.user.role === "Admin";
    let isDoctor = false;
    if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      isDoctor = doctor && doctor.doctor_id === prescription.doctor_id;
    }

    if (!isAdmin && !isDoctor) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You can only delete your own prescriptions");
    }

    // Delete items first, then prescription
    await PrescriptionItem.destroy({
      where: { prescription_id: prescription.prescription_id },
    });
    await prescription.destroy();

    return successResponse(res, HTTP_STATUS.OK, "Prescription deleted successfully");
  } catch (error) {
    console.error("Delete prescription error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get prescription stats for the logged-in doctor
 * @route GET /api/prescriptions/stats
 * @access Private (Doctor)
 */
export const getPrescriptionStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Doctor profile not found");
    }

    const totalPrescriptions = await Prescription.count({
      where: { doctor_id: doctor.doctor_id },
    });

    const activePrescriptions = await Prescription.count({
      where: { doctor_id: doctor.doctor_id, status: "active" },
    });

    const completedPrescriptions = await Prescription.count({
      where: { doctor_id: doctor.doctor_id, status: "completed" },
    });

    const cancelledPrescriptions = await Prescription.count({
      where: { doctor_id: doctor.doctor_id, status: "cancelled" },
    });

    // Unique patients
    const uniquePatients = await Prescription.count({
      where: { doctor_id: doctor.doctor_id },
      distinct: true,
      col: "patient_id",
    });

    return successResponse(res, HTTP_STATUS.OK, "Prescription stats retrieved", {
      totalPrescriptions,
      activePrescriptions,
      completedPrescriptions,
      cancelledPrescriptions,
      uniquePatients,
    });
  } catch (error) {
    console.error("Get prescription stats error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get prescriptions for a patient (patient can view their own)
 * @route GET /api/prescriptions/patient/:patient_id
 * @access Private (Patient themselves, Doctor, Admin)
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { limit, offset, page } = getPagination(req.query);

    // Permission check
    const isAdmin = req.user.role === "Admin";
    const isPatient = req.user.id === parseInt(patient_id);
    const isDoctor = req.user.role === "Doctor";

    if (!isAdmin && !isPatient && !isDoctor) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    const where = { patient_id: parseInt(patient_id) };

    // If doctor, only show their prescriptions for this patient
    if (isDoctor && !isAdmin) {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (doctor) {
        where.doctor_id = doctor.doctor_id;
      }
    }

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where,
      include: prescriptionIncludes,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    const response = formatPaginatedResponse(prescriptions, count, page, limit);
    return successResponse(res, HTTP_STATUS.OK, "Patient prescriptions retrieved", response);
  } catch (error) {
    console.error("Get patient prescriptions error:", error);
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};
