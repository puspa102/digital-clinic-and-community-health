import { Order, OrderItem } from "../models/order.model.js";
import InventoryItem from "../models/inventory.model.js";
import Pharmacy from "../models/pharmacy.model.js";
import sequelize from "../database/database.js";
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
  ORDER_STATUS,
} from "../utils/constants.js";

/**
 * Helper: resolve the Pharmacy record for the currently logged-in pharmacy user
 */
const getPharmacyForCurrentUser = async (userId) => {
  return Pharmacy.findOne({ where: { user_id: userId } });
};

// ============================================
// Get all orders for the logged-in pharmacy
// ============================================

/**
 * @route GET /api/orders
 * @access Private (Pharmacy)
 */
export const getOrders = async (req, res) => {
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
    const { status, search, date_from, date_to } = req.query;

    const where = { pharmacy_id: pharmacy.pharmacy_id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { supplier_name: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (date_from || date_to) {
      where.order_date = {};
      if (date_from) where.order_date[Op.gte] = date_from;
      if (date_to) where.order_date[Op.lte] = date_to;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: InventoryItem,
              attributes: ["inventory_id", "medicine_name", "category"],
              required: false,
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const response = formatPaginatedResponse(orders, count, page, limit);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Orders retrieved successfully",
      response
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Get single order
// ============================================

/**
 * @route GET /api/orders/:id
 * @access Private (Pharmacy)
 */
export const getOrderById = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const order = await Order.findOne({
      where: {
        order_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: InventoryItem,
              attributes: [
                "inventory_id",
                "medicine_name",
                "generic_name",
                "category",
              ],
              required: false,
            },
          ],
        },
      ],
    });

    if (!order) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Order not found"
      );
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Order retrieved successfully",
      order
    );
  } catch (error) {
    console.error("Get order by ID error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Create order
// ============================================

/**
 * @route POST /api/orders
 * @access Private (Pharmacy)
 */
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      await transaction.rollback();
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const {
      supplier_name,
      supplier_contact,
      order_date,
      expected_delivery_date,
      notes,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "At least one order item is required"
      );
    }

    // Calculate total amount from items
    const totalAmount = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0
    );

    // Create the order
    const order = await Order.create(
      {
        pharmacy_id: pharmacy.pharmacy_id,
        supplier_name,
        supplier_contact: supplier_contact || null,
        order_date: order_date || new Date().toISOString().split("T")[0],
        expected_delivery_date: expected_delivery_date || null,
        total_amount: totalAmount,
        notes: notes || null,
      },
      { transaction }
    );

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.order_id,
      inventory_id: item.inventory_id || null,
      medicine_name: item.medicine_name,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();

    // Fetch the complete order with items
    const createdOrder = await Order.findByPk(order.order_id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: InventoryItem,
              attributes: ["inventory_id", "medicine_name", "category"],
              required: false,
            },
          ],
        },
      ],
    });

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Order created successfully",
      createdOrder
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Create order error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Update order status
// ============================================

/**
 * @route PUT /api/orders/:id/status
 * @access Private (Pharmacy)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const order = await Order.findOne({
      where: {
        order_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!order) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Order not found"
      );
    }

    // If order is delivered, optionally update inventory quantities
    if (status === "delivered" && order.status !== "delivered") {
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.order_id },
      });

      for (const orderItem of orderItems) {
        if (orderItem.inventory_id) {
          const inventoryItem = await InventoryItem.findByPk(
            orderItem.inventory_id
          );
          if (inventoryItem) {
            await inventoryItem.update({
              quantity: inventoryItem.quantity + orderItem.quantity,
              updated_at: new Date(),
            });
          }
        }
      }
    }

    await order.update({
      status,
      updated_at: new Date(),
    });

    // Fetch updated order with items
    const updatedOrder = await Order.findByPk(order.order_id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: InventoryItem,
              attributes: ["inventory_id", "medicine_name", "category"],
              required: false,
            },
          ],
        },
      ],
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Order status updated successfully",
      updatedOrder
    );
  } catch (error) {
    console.error("Update order status error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Update order details
// ============================================

/**
 * @route PUT /api/orders/:id
 * @access Private (Pharmacy)
 */
export const updateOrder = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const order = await Order.findOne({
      where: {
        order_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!order) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Order not found"
      );
    }

    // Only allow editing pending orders
    if (order.status !== "pending") {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Only pending orders can be edited"
      );
    }

    const allowedFields = [
      "supplier_name",
      "supplier_contact",
      "expected_delivery_date",
      "notes",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    updateData.updated_at = new Date();

    await order.update(updateData);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Order updated successfully",
      order
    );
  } catch (error) {
    console.error("Update order error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Delete order
// ============================================

/**
 * @route DELETE /api/orders/:id
 * @access Private (Pharmacy)
 */
export const deleteOrder = async (req, res) => {
  try {
    const pharmacy = await getPharmacyForCurrentUser(req.user.id);
    if (!pharmacy) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Your pharmacy profile was not found."
      );
    }

    const order = await Order.findOne({
      where: {
        order_id: req.params.id,
        pharmacy_id: pharmacy.pharmacy_id,
      },
    });

    if (!order) {
      return errorResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        "Order not found"
      );
    }

    // Only allow deleting pending orders
    if (order.status !== "pending" && order.status !== "cancelled") {
      return errorResponse(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Only pending or cancelled orders can be deleted"
      );
    }

    // Delete order items first, then the order
    await OrderItem.destroy({ where: { order_id: order.order_id } });
    await order.destroy();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Order deleted successfully"
    );
  } catch (error) {
    console.error("Delete order error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};

// ============================================
// Get order stats
// ============================================

/**
 * @route GET /api/orders/stats
 * @access Private (Pharmacy)
 */
export const getOrderStats = async (req, res) => {
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

    const totalOrders = await Order.count({
      where: { pharmacy_id: pharmacyId },
    });

    const pendingOrders = await Order.count({
      where: { pharmacy_id: pharmacyId, status: "pending" },
    });

    const deliveredOrders = await Order.count({
      where: { pharmacy_id: pharmacyId, status: "delivered" },
    });

    const cancelledOrders = await Order.count({
      where: { pharmacy_id: pharmacyId, status: "cancelled" },
    });

    // Total spent (delivered orders)
    const deliveredOrdersList = await Order.findAll({
      where: { pharmacy_id: pharmacyId, status: "delivered" },
      attributes: ["total_amount"],
    });

    const totalSpent = deliveredOrdersList.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    );

    return successResponse(res, HTTP_STATUS.OK, "Order stats retrieved", {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent: totalSpent.toFixed(2),
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return errorResponse(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.SERVER_ERROR
    );
  }
};
