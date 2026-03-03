import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api, {
  pharmacyAPI,
  handleApiError,
  formatDate,
  APPOINTMENT_STATUS,
} from "../../services/api";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Pill,
  RefreshCw,
  FileText,
  Activity,
} from "lucide-react";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    expiredItems: 0,
    outOfStock: 0,
    totalValue: "0.00",
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalSpent: "0.00",
  });

  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    requested: 0,
    assigned: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [doctorCount, setDoctorCount] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [inventoryRes, orderRes, doctorsRes, appointmentsRes] =
        await Promise.all([
          api.get("/inventory/stats").catch(() => ({ data: { data: {} } })),
          api.get("/orders/stats").catch(() => ({ data: { data: {} } })),
          pharmacyAPI.getMyDoctors().catch(() => ({ data: [] })),
          pharmacyAPI.getMyAppointments({ limit: 100 }).catch(() => ({ data: [] })),
        ]);

      // Inventory stats
      if (inventoryRes?.data?.data) {
        setInventoryStats(inventoryRes.data.data);
      }

      // Order stats
      if (orderRes?.data?.data) {
        setOrderStats(orderRes.data.data);
      }

      // Doctor count
      const doctors = doctorsRes?.data || [];
      setDoctorCount(doctors.length);

      // Appointment stats
      const appointments = appointmentsRes?.data || [];
      setRecentAppointments(appointments.slice(0, 10));

      const appointmentCounts = {
        total: appointments.length,
        requested: appointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.REQUESTED
        ).length,
        assigned: appointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.ASSIGNED
        ).length,
        confirmed: appointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.CONFIRMED
        ).length,
        completed: appointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.COMPLETED
        ).length,
        cancelled: appointments.filter(
          (a) => a.status === APPOINTMENT_STATUS.CANCELLED
        ).length,
      };
      setAppointmentStats(appointmentCounts);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllStats(true);
  };

  // Calculate percentages for progress bars
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading reports...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reports & Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Overview of your pharmacy performance
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-xl transition-colors font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {doctorCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Doctors
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appointmentStats.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Appointments
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventoryStats.totalItems}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Inventory Items
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orderStats.totalOrders}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Inventory Value</p>
                <p className="text-3xl font-bold mt-1">
                  Rs. {Number(inventoryStats.totalValue).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Order Spending</p>
                <p className="text-3xl font-bold mt-1">
                  Rs. {Number(orderStats.totalSpent).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Inventory Insights
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stock status overview
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Low Stock */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Low Stock Items
                  </span>
                </div>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {inventoryStats.lowStockCount}
                </span>
              </div>

              {/* Out of Stock */}
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Out of Stock
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {inventoryStats.outOfStock}
                </span>
              </div>

              {/* Expired Items */}
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Expired Items
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {inventoryStats.expiredItems}
                </span>
              </div>

              {/* Total Items */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Total Active Items
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {inventoryStats.totalItems}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Order Summary
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order status breakdown
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Pending Orders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pending
                  </span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {orderStats.pendingOrders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${getPercentage(
                        orderStats.pendingOrders,
                        orderStats.totalOrders
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Delivered Orders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Delivered
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {orderStats.deliveredOrders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${getPercentage(
                        orderStats.deliveredOrders,
                        orderStats.totalOrders
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Cancelled Orders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cancelled
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {orderStats.cancelledOrders}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${getPercentage(
                        orderStats.cancelledOrders,
                        orderStats.totalOrders
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Orders
                  </span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {orderStats.totalOrders}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Appointment Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Breakdown by status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {appointmentStats.requested}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Requested
              </p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {appointmentStats.assigned}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Assigned
              </p>
            </div>

            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {appointmentStats.confirmed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Confirmed
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {appointmentStats.completed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Completed
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {appointmentStats.cancelled}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cancelled
              </p>
            </div>

            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {appointmentStats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          {appointmentStats.total > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                  {getPercentage(
                    appointmentStats.completed,
                    appointmentStats.total
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${getPercentage(
                      appointmentStats.completed,
                      appointmentStats.total
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recent Appointments
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Latest appointment activity
                </p>
              </div>
            </div>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No appointments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold">
                        {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() ||
                          "P"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appointment.Patient?.full_name || "Patient"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(appointment.appointment_date)} •{" "}
                          {appointment.Doctor?.User?.full_name
                            ? `Dr. ${appointment.Doctor.User.full_name}`
                            : "No doctor assigned"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        appointment.status === APPOINTMENT_STATUS.COMPLETED
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : appointment.status === APPOINTMENT_STATUS.CANCELLED
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : appointment.status === APPOINTMENT_STATUS.CONFIRMED
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : appointment.status === APPOINTMENT_STATUS.ASSIGNED
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {appointment.status?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Generation Note */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Export Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Detailed report generation and PDF export functionality will be
                available in future updates. Stay tuned for enhanced analytics
                and reporting features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
