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

  // QR Code modal
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
    const reason = window.prompt(
      "Please provide a reason for cancellation (optional):",
    );
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
      [
        APPOINTMENT_STATUS.REQUESTED,
        APPOINTMENT_STATUS.ASSIGNED,
        APPOINTMENT_STATUS.CONFIRMED,
      ].includes(a.status),
    ).length,
    completed: appointments.filter(
      (a) => a.status === APPOINTMENT_STATUS.COMPLETED,
    ).length,
    cancelled: appointments.filter(
      (a) => a.status === APPOINTMENT_STATUS.CANCELLED,
    ).length,
    total: appointments.length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage your appointments
            </p>
          </div>
          <Link
            to="/patient/pharmacies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Book New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-sky-600 dark:bg-sky-700 rounded-xl p-4 shadow-md">
            <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
            <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
              Upcoming
            </p>
          </div>
          <div className="bg-emerald-600 dark:bg-emerald-700 rounded-xl p-4 shadow-md">
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
              Completed
            </p>
          </div>
          <div className="bg-rose-600 dark:bg-rose-700 rounded-xl p-4 shadow-md">
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
            <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
              Cancelled
            </p>
          </div>
          <div className="bg-violet-600 dark:bg-violet-700 rounded-xl p-4 shadow-md">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
              Total Shown
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming only
              </span>
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading appointments...
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
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
                className="mt-4 inline-block text-teal-600 hover:underline"
              >
                Book your first appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {appointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div className="shrink-0 w-16 h-16 bg-teal-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-teal-600 uppercase">
                          {new Date(
                            appointment.appointment_date,
                          ).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold text-teal-700">
                          {new Date(appointment.appointment_date).getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {appointment.Pharmacy?.pharmacy_name || "Pharmacy"}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                              appointment.status,
                            )}`}
                          >
                            {appointment.status?.replace("_", " ")}
                          </span>
                          {appointment.consultation_type && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                                appointment.consultation_type === "online"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-teal-100 text-teal-700"
                              }`}
                            >
                              {appointment.consultation_type === "online"
                                ? "?? Online"
                                : "?? Physical"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatTime(
                            appointment.scheduled_time ||
                              appointment.appointment_time,
                          )}{" "}
                          � {appointment.Pharmacy?.address || ""}
                        </p>
                        {appointment.Doctor ? (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Doctor:</span>{" "}
                            {appointment.Doctor?.User?.full_name} (
                            {appointment.Doctor?.specialization})
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600 mt-1">
                            Doctor not yet assigned
                          </p>
                        )}
                        {appointment.reason && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            <span className="font-medium">Reason:</span>{" "}
                            {appointment.reason}
                          </p>
                        )}
                        {appointment.doctor_notes && (
                          <p className="text-sm text-teal-600 mt-1">
                            <span className="font-medium">Doctor's Note:</span>{" "}
                            {appointment.doctor_notes}
                          </p>
                        )}

                        {/* Doctor Fee - shown when confirmed */}
                        {appointment.payment_amount > 0 &&
                          appointment.status !==
                            APPOINTMENT_STATUS.REQUESTED && (
                            <div className="mt-2 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5">
                              <svg
                                className="w-4 h-4 text-green-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                              <span className="text-sm font-semibold text-green-700">
                                Doctor Fee: Rs. {appointment.payment_amount}
                              </span>
                              <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                  appointment.payment_status === "paid"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                              >
                                {appointment.payment_status === "paid"
                                  ? "Paid"
                                  : "Pending"}
                              </span>
                            </div>
                          )}

                        {/* Meeting Link for online */}
                        {appointment.consultation_type === "online" &&
                          appointment.meeting_link &&
                          appointment.status ===
                            APPOINTMENT_STATUS.CONFIRMED && (
                            <div className="mt-2">
                              <a
                                href={appointment.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                                </svg>
                                Join Online Meeting
                              </a>
                            </div>
                          )}

                        <p className="text-xs text-gray-400 mt-1">
                          {getStatusDescription(appointment.status)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:shrink-0">
                      {canCancel(appointment.status) && (
                        <button
                          onClick={() =>
                            handleCancel(appointment.appointment_id)
                          }
                          disabled={
                            actionLoading === appointment.appointment_id
                          }
                          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                        >
                          {actionLoading === appointment.appointment_id && (
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Flow Explanation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            How It Works
          </h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold text-xs">
                1
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Requested</strong> � You book at a pharmacy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold text-xs">
                2
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Assigned</strong> � Pharmacy assigns a doctor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-xs">
                3
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Confirmed</strong> — Doctor sets time & type, fee shown
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs">
                4
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                <strong>Completed</strong> � Done!
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
