import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  orderAPI,
  inventoryAPI,
  handleApiError,
  formatDate,
  getStatusBadgeClass,
} from "../../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // View order modal
  const [viewOrder, setViewOrder] = useState(null);

  // Status update
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_contact: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    notes: "",
    items: [{ medicine_name: "", quantity: 1, unit_price: 0, inventory_id: null }],
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchInventoryItems();
  }, [pagination.page, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await orderAPI.getOrders(params);
      setOrders(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.totalItems || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await orderAPI.getOrderStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch order stats:", err);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await inventoryAPI.getInventory({ limit: 100 });
      setInventoryItems(response.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_name: "",
      supplier_contact: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: "",
      notes: "",
      items: [{ medicine_name: "", quantity: 1, unit_price: 0, inventory_id: null }],
    });
    setModalError(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { medicine_name: "", quantity: 1, unit_price: 0, inventory_id: null },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If user selected an inventory item, auto-fill the medicine name
    if (field === "inventory_id" && value) {
      const item = inventoryItems.find(
        (inv) => inv.inventory_id === parseInt(value)
      );
      if (item) {
        newItems[index].medicine_name = item.medicine_name;
        newItems[index].unit_price = Number(item.unit_price) || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0
    );
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError(null);

      const orderData = {
        ...formData,
        items: formData.items.map((item) => ({
          ...item,
          inventory_id: item.inventory_id ? parseInt(item.inventory_id) : null,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
        })),
      };

      await orderAPI.createOrder(orderData);
      setShowCreateModal(false);
      resetForm();
      fetchOrders();
      fetchStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setModalError(errorInfo.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setStatusUpdating(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      fetchStats();
      if (viewOrder && viewOrder.order_id === orderId) {
        const updated = await orderAPI.getOrderById(orderId);
        setViewOrder(updated.data);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await orderAPI.deleteOrder(orderId);
      setDeleteConfirm(null);
      fetchOrders();
      fetchStats();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading && orders.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track and manage supplier orders
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Order
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500">
              <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
              <p className="text-2xl font-bold text-purple-600">Rs. {Number(stats.totalSpent).toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by supplier name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Order #</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Supplier</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Expected Delivery</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Items</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm">Create your first order to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          #{order.order_id}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.supplier_name}
                          </p>
                          {order.supplier_contact && (
                            <p className="text-xs text-gray-500">{order.supplier_contact}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(order.order_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {order.expected_delivery_date
                          ? formatDate(order.expected_delivery_date)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        {order.OrderItems?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        Rs. {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Status action buttons */}
                          {getNextStatuses(order.status).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() =>
                                handleStatusUpdate(order.order_id, nextStatus)
                              }
                              disabled={statusUpdating === order.order_id}
                              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                                nextStatus === "cancelled"
                                  ? "text-red-600 hover:bg-red-50 border border-red-200"
                                  : "text-blue-600 hover:bg-blue-50 border border-blue-200"
                              } disabled:opacity-50`}
                              title={`Mark as ${nextStatus}`}
                            >
                              {nextStatus}
                            </button>
                          ))}
                          {/* View */}
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {/* Delete (only pending/cancelled) */}
                          {(order.status === "pending" ||
                            order.status === "cancelled") && (
                            <button
                              onClick={() => setDeleteConfirm(order)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Order
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier_name}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Nepal Medical Supplies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Contact
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplier_contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      setFormData({ ...formData, order_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_delivery_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Any special instructions..."
                />
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <select
                          value={item.inventory_id || ""}
                          onChange={(e) =>
                            handleItemChange(index, "inventory_id", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                        >
                          <option value="">-- Select from inventory --</option>
                          {inventoryItems.map((inv) => (
                            <option key={inv.inventory_id} value={inv.inventory_id}>
                              {inv.medicine_name} (Stock: {inv.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={item.medicine_name}
                          onChange={(e) =>
                            handleItemChange(index, "medicine_name", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Medicine name"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, "unit_price", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 dark:text-white"
                          placeholder="Price"
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-end">
                        Rs. {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg self-center"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: Rs. {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  {saving ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Order #{viewOrder.order_id}
              </h2>
              <button
                onClick={() => setViewOrder(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewOrder.supplier_name}
                  </p>
                  {viewOrder.supplier_contact && (
                    <p className="text-sm text-gray-500">{viewOrder.supplier_contact}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                      viewOrder.status
                    )}`}
                  >
                    {viewOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(viewOrder.order_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expected Delivery</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewOrder.expected_delivery_date
                      ? formatDate(viewOrder.expected_delivery_date)
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {viewOrder.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{viewOrder.notes}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Items
                </p>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300">Medicine</th>
                        <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Qty</th>
                        <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Unit Price</th>
                        <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                      {(viewOrder.OrderItems || []).map((item) => (
                        <tr key={item.order_item_id}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">
                            {item.medicine_name}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">
                            Rs. {Number(item.unit_price).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
                            Rs. {Number(item.total_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colSpan="3" className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                          Total
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                          Rs. {Number(viewOrder.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Actions */}
              {getNextStatuses(viewOrder.status).length > 0 && (
                <div className="flex gap-2 pt-2">
                  {getNextStatuses(viewOrder.status).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() =>
                        handleStatusUpdate(viewOrder.order_id, nextStatus)
                      }
                      disabled={statusUpdating === viewOrder.order_id}
                      className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                        nextStatus === "cancelled"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      } disabled:opacity-50`}
                    >
                      Mark as {nextStatus}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Order
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete order{" "}
              <span className="font-medium">#{deleteConfirm.order_id}</span> from{" "}
              <span className="font-medium">{deleteConfirm.supplier_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.order_id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
