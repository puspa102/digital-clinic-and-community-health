import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  appointmentAPI,
  getStatusBadgeClass,
  formatTime,
  handleApiError,
  APPOINTMENT_STATUS,
} from "../../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, statusFilter, showUpcoming]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getMyAppointments({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        upcoming: showUpcoming ? "true" : undefined,
      });
      // API returns { success, data: [...], pagination: {...} }
      setAppointments(response.data || []);
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

  const handleCancel = async (appointmentId) => {
    const reason = window.prompt("Please provide a reason for cancellation (optional):");
    if (reason === null) return; // User clicked cancel on prompt

    try {
      setActionLoading(appointmentId);
      await appointmentAPI.cancelAppointment(appointmentId, reason);
      fetchAppointments();
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: APPOINTMENT_STATUS.REQUESTED, label: "Requested" },
    { value: APPOINTMENT_STATUS.ASSIGNED, label: "Assigned" },
    { value: APPOINTMENT_STATUS.CONFIRMED, label: "Confirmed" },
    { value: APPOINTMENT_STATUS.COMPLETED, label: "Completed" },
    { value: APPOINTMENT_STATUS.CANCELLED, label: "Cancelled" },
    { value: APPOINTMENT_STATUS.NO_SHOW, label: "No Show" },
  ];

  const getStatusDescription = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.REQUESTED:
        return "Waiting for pharmacy to assign a doctor";
      case APPOINTMENT_STATUS.ASSIGNED:
        return "Doctor assigned, waiting for confirmation";
      case APPOINTMENT_STATUS.CONFIRMED:
        return "Appointment confirmed by doctor";
      case APPOINTMENT_STATUS.COMPLETED:
        return "Appointment completed";
      case APPOINTMENT_STATUS.CANCELLED:
        return "Appointment was cancelled";
      case APPOINTMENT_STATUS.NO_SHOW:
        return "Marked as no-show";
      default:
        return "";
    }
  };

  const canCancel = (status) => {
    return [
      APPOINTMENT_STATUS.REQUESTED,
      APPOINTMENT_STATUS.ASSIGNED,
      APPOINTMENT_STATUS.CONFIRMED,
    ].includes(status);
  };

  // Calculate stats
  const stats = {
    upcoming: appointments.filter((a) =>
      [APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.ASSIGNED, APPOINTMENT_STATUS.CONFIRMED].includes(a.status)
    ).length,
    completed: appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    cancelled: appointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED).length,
    total: appointments.length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500">View and manage your appointments</p>
          </div>
          <Link
            to="/patient/pharmacies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Book New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Shown</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUpcoming}
                onChange={(e) => {
                  setShowUpcoming(e.target.checked);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Upcoming only</span>
            </label>
            {(statusFilter || showUpcoming) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setShowUpcoming(false);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>No appointments found</p>
              <Link
                to="/patient/pharmacies"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Book your first appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          {new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold text-blue-700">
                          {new Date(appointment.appointment_date).getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {appointment.Pharmacy?.pharmacy_name || "Pharmacy"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status?.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatTime(appointment.appointment_time)} •{" "}
                          {appointment.Pharmacy?.address || ""}
                        </p>
                        {appointment.Doctor ? (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Doctor:</span>{" "}
                            {appointment.Doctor?.User?.full_name} ({appointment.Doctor?.specialization})
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600 mt-1">
                            Doctor not yet assigned
                          </p>
                        )}
                        {appointment.reason && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {getStatusDescription(appointment.status)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:flex-shrink-0">
                      {canCancel(appointment.status) && (
                        <button
                          onClick={() => handleCancel(appointment.appointment_id)}
                          disabled={actionLoading === appointment.appointment_id}
                          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                        >
                          {actionLoading === appointment.appointment_id && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Flow Explanation */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">How It Works</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs">
                1
              </div>
              <span className="text-gray-600">
                <strong>Requested</strong> — You book at a pharmacy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                2
              </div>
              <span className="text-gray-600">
                <strong>Assigned</strong> — Pharmacy assigns a doctor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                3
              </div>
              <span className="text-gray-600">
                <strong>Confirmed</strong> — Doctor confirms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                4
              </div>
              <span className="text-gray-600">
                <strong>Completed</strong> — Done!
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;