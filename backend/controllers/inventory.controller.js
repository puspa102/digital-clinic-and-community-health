import InventoryItem from "../models/inventory.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import { Op } from "sequelize";
import sequelize from "../database/database.js";
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
 * Helper: resolve the Pharmacy record for the currently logged-in pharmacy user
 */
const getPharmacyForCurrentUser = async (userId) => {
  return Pharmacy.findOne({ where: { user_id: userId } });
};

// ============================================
// Get all inventory items for the logged-in pharmacy
// ============================================

/**
 * @route GET /api/inventory
 * @access Private (Pharmacy)
 */
export const getInventory = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const { limit, offset, page } = getPagination(req.query);
    const { search, category, low_stock, expired } = req.query;

    const where = { pharmacy_id: pharmacy.pharmacy_id, is_active: true };

    if (search) {
      where[Op.or] = [
        { medicine_name: { [Op.iLike]: `%${search}%` } },
        { generic_name: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { batch_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    }

    // Filter items below reorder level
    if (low_stock === "true") {
      where.quantity = {
        [Op.lte]: sequelize.col("reorder_level"),
      };
    }

    // Filter expired items
    if (expired === "true") {
      where.expiry_date = {
        [Op.lt]: new Date(),
      };
    }

    const { count, rows: items } = await InventoryItem.findAndCountAll({
      where,
      limit,
      offset,
      order: [["medicine_name", "ASC"]],
    });

    const response = formatPaginatedResponse(items, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Inventory retrieved successfully",
      response
    );
  } catch (error) {
    console.error("Get inventory error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Get single inventory item
// ============================================

/**
 * @route GET /api/inventory/:id
 * @access Private (Pharmacy)
 */
export const getInventoryItem = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const item = await InventoryItem.findOne({
      where: {
        inventory_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!item) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Inventory item not found"
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Inventory item retrieved successfully",
      item
    );
  } catch (error) {
    console.error("Get inventory item error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Create inventory item
// ============================================

/**
 * @route POST /api/inventory
 * @access Private (Pharmacy)
 */
export const createInventoryItem = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const {
      medicine_name,
      generic_name,
      category,
      manufacturer,
      batch_number,
      expiry_date,
      quantity,
      unit_price,
      selling_price,
      reorder_level,
      description,
    } = req.body;

    const item = await InventoryItem.create({
      pharmacy_id: pharmacy.pharmacy_id,
      medicine_name,
      generic_name: generic_name || null,
      category: category || "General",
      manufacturer: manufacturer || null,
      batch_number: batch_number || null,
      expiry_date: expiry_date || null,
      quantity: quantity || 0,
      unit_price: unit_price || 0,
      selling_price: selling_price || 0,
      reorder_level: reorder_level || 10,
      description: description || null,
    });

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Inventory item created successfully",
      item
    );
  } catch (error) {
    console.error("Create inventory item error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Update inventory item
// ============================================

/**
 * @route PUT /api/inventory/:id
 * @access Private (Pharmacy)
 */
export const updateInventoryItem = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const item = await InventoryItem.findOne({
      where: {
        inventory_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!item) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Inventory item not found"
      );
    }

    const allowedFields = [
      "medicine_name",
      "generic_name",
      "category",
      "manufacturer",
      "batch_number",
      "expiry_date",
      "quantity",
      "unit_price",
      "selling_price",
      "reorder_level",
      "description",
      "is_active",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    updateData.updated_at = new Date();

    await item.update(updateData);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Inventory item updated successfully",
      item
    );
  } catch (error) {
    console.error("Update inventory item error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Delete inventory item (soft delete)
// ============================================

/**
 * @route DELETE /api/inventory/:id
 * @access Private (Pharmacy)
 */
export const deleteInventoryItem = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const item = await InventoryItem.findOne({
      where: {
        inventory_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!item) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Inventory item not found"
      );
    }

    // Soft delete
    await item.update({ is_active: false, updated_at: new Date() });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Inventory item deleted successfully"
    );
  } catch (error) {
    console.error("Delete inventory item error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Get inventory stats
// ============================================

/**
 * @route GET /api/inventory/stats
 * @access Private (Pharmacy)
 */
export const getInventoryStats = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const pharmacyId = pharmacy.pharmacy_id;

    const totalItems = await InventoryItem.count({
      where: { pharmacy_id: pharmacyId, is_active: true },
    });

    const lowStockItems = await InventoryItem.findAll({
      where: {
        pharmacy_id: pharmacyId,
        is_active: true,
      },
    });

    const lowStockCount = lowStockItems.filter(
      (item) => item.quantity <= item.reorder_level
    ).length;

    const expiredItems = await InventoryItem.count({
      where: {
        pharmacy_id: pharmacyId,
        is_active: true,
        expiry_date: { [Op.lt]: new Date() },
      },
    });

    const outOfStock = await InventoryItem.count({
      where: {
        pharmacy_id: pharmacyId,
        is_active: true,
        quantity: 0,
      },
    });

    // Calculate total inventory value
    const allItems = await InventoryItem.findAll({
      where: { pharmacy_id: pharmacyId, is_active: true },
      attributes: ["quantity", "unit_price"],
    });

    const totalValue = allItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    return successResponse(res, HTTP_STATUS.OK, "Inventory stats retrieved", {
      totalItems,
      lowStockCount,
      expiredItems,
      outOfStock,
      totalValue: totalValue.toFixed(2),
    });
  } catch (error) {
    console.error("Get inventory stats error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};
