import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import { appointmentAPI, handleApiError, getStatusBadgeClass, formatDate, formatTime, formatDateTime } from "../../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    search: "",
  });

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status) params.status = filters.status;
      if (filters.payment_status) params.payment_status = filters.payment_status;

      const response = await appointmentAPI.getAllAppointments(params);
      console.log("Appointments API Response:", response);

      if (response.success) {
        const appointmentsData = response.data || [];
        console.log("Appointments data:", appointmentsData);
        setAppointments(appointmentsData);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      } else {
        setError(response.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Appointments API Error:", err);
      const errorData = handleApiError(err);
      setError(errorData.message || "Failed to connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.status, filters.payment_status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewAppointment = async (appointmentId) => {
    try {
      setActionLoading(true);
      const response = await appointmentAPI.getAppointmentById(appointmentId);
      if (response.success) {
        setSelectedAppointment(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await appointmentAPI.updateAppointmentStatus(selectedAppointment.appointment_id, status);
      if (response.success) {
        setShowStatusModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await appointmentAPI.cancelAppointment(selectedAppointment.appointment_id, cancelReason);
      if (response.success) {
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setCancelReason("");
        fetchAppointments();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  // Filter appointments by search term (client-side)
  const filteredAppointments = appointments.filter((apt) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      apt.Patient?.full_name?.toLowerCase().includes(searchLower) ||
      apt.Patient?.email?.toLowerCase().includes(searchLower) ||
      apt.Doctor?.User?.full_name?.toLowerCase().includes(searchLower) ||
      apt.Pharmacy?.pharmacy_name?.toLowerCase().includes(searchLower) ||
      apt.reason?.toLowerCase().includes(searchLower)
    );
  });

  // Status options for filter
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "requested", label: "Requested" },
    { value: "assigned", label: "Assigned" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no_show", label: "No Show" },
  ];

  const paymentStatusOptions = [
    { value: "", label: "All Payment Status" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
  ];

  // Get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus) => {
    const transitions = {
      requested: ["assigned", "cancelled"],
      assigned: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled", "no_show"],
      completed: [],
      cancelled: [],
      no_show: [],
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      requested: "Requested",
      assigned: "Assigned",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return labels[status] || status;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600 mt-1">View and manage all appointments across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Total: <span className="font-semibold">{pagination.total}</span> appointments
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by patient, doctor, pharmacy..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={filters.payment_status}
                onChange={(e) => handleFilterChange("payment_status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {paymentStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: "", payment_status: "", search: "" });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Appointments Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor / Pharmacy
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No appointments found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{appointment.Patient?.full_name || "Unknown"}</p>
                                <p className="text-sm text-gray-500">{appointment.Patient?.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {appointment.Doctor?.User?.full_name || "Not assigned"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.Pharmacy?.pharmacy_name || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                              <p className="text-sm text-gray-500">{formatTime(appointment.appointment_time)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(appointment.status)}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(appointment.payment_status)}`}
                              >
                                {appointment.payment_status}
                              </span>
                              {appointment.payment_amount && (
                                <p className="text-sm text-gray-500 mt-1">Rs. {appointment.payment_amount}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewAppointment(appointment.appointment_id)}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              {!["completed", "cancelled", "no_show"].includes(appointment.status) && (
                                <>
                                  <button
                                    onClick={() => openStatusModal(appointment)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Change Status"
                                  >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M12 20h9" />
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => openCancelModal(appointment)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel Appointment"
                                  >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="15" y1="9" x2="9" y2="15" />
                                      <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-4">
                <p className="text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Appointment ID</p>
                  <p className="font-bold text-gray-900">#{selectedAppointment.appointment_id}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-4 py-2 text-sm font-medium rounded-full capitalize ${getStatusBadgeClass(selectedAppointment.status)}`}>
                    {getStatusLabel(selectedAppointment.status)}
                  </span>
                  <span className={`px-4 py-2 text-sm font-medium rounded-full capitalize ${getStatusBadgeClass(selectedAppointment.payment_status)}`}>
                    {selectedAppointment.payment_status}
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled For</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                  </p>
                </div>
              </div>

              {/* Patient Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Patient?.full_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Patient?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Patient?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="font-medium text-gray-900">#{selectedAppointment.patient_id}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Doctor Information
                </h4>
                {selectedAppointment.Doctor ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.Doctor.User?.full_name || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.Doctor.specialization || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.Doctor.User?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.Doctor.User?.phone || "N/A"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Doctor not yet assigned</p>
                )}
              </div>

              {/* Pharmacy Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Pharmacy Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Pharmacy?.pharmacy_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Pharmacy?.phone || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.Pharmacy?.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedAppointment.reason && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reason for Visit</h4>
                  <p className="text-gray-600">{selectedAppointment.reason}</p>
                </div>
              )}

              {/* Payment Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(selectedAppointment.payment_status)}`}>
                      {selectedAppointment.payment_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.payment_amount ? `Rs. ${selectedAppointment.payment_amount}` : "Not set"}
                    </p>
                  </div>
                  {selectedAppointment.payment_reference && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Reference</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.payment_reference}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-gray-500">
                Created: {formatDateTime(selectedAppointment.created_at)}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {!["completed", "cancelled", "no_show"].includes(selectedAppointment.status) && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openStatusModal(selectedAppointment);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Status
                </button>
              )}
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Change Appointment Status</h2>
              <p className="text-gray-500 mt-1">Update status for appointment #{selectedAppointment.appointment_id}</p>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Current status: <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(selectedAppointment.status)}`}>{getStatusLabel(selectedAppointment.status)}</span>
              </p>

              {getValidNextStatuses(selectedAppointment.status).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No status transitions available for this appointment.</p>
              ) : (
                getValidNextStatuses(selectedAppointment.status).map((status) => {
                  const statusConfig = {
                    assigned: { bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100", label: "Mark as Assigned" },
                    confirmed: { bg: "bg-green-50", text: "text-green-700", hover: "hover:bg-green-100", label: "Confirm Appointment" },
                    completed: { bg: "bg-gray-50", text: "text-gray-700", hover: "hover:bg-gray-100", label: "Mark as Completed" },
                    cancelled: { bg: "bg-red-50", text: "text-red-700", hover: "hover:bg-red-100", label: "Cancel Appointment" },
                    no_show: { bg: "bg-orange-50", text: "text-orange-700", hover: "hover:bg-orange-100", label: "Mark as No Show" },
                  };
                  const config = statusConfig[status];

                  if (status === "cancelled") {
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setShowStatusModal(false);
                          openCancelModal(selectedAppointment);
                        }}
                        disabled={actionLoading}
                        className={`w-full px-4 py-3 ${config.bg} ${config.text} rounded-lg ${config.hover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between`}
                      >
                        <span className="font-medium">{config.label}</span>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={actionLoading}
                      className={`w-full px-4 py-3 ${config.bg} ${config.text} rounded-lg ${config.hover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between`}
                    >
                      <span className="font-medium">{config.label}</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">Cancel Appointment</h2>
              <p className="text-gray-500 text-center mt-2">
                Are you sure you want to cancel appointment #{selectedAppointment.appointment_id}?
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setCancelReason("");
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Appointments;