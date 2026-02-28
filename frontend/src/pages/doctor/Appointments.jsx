import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  appointmentAPI,
  getStatusBadgeClass,
  formatDate,
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingAppointment, setConfirmingAppointment] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    consultation_type: "physical",
    scheduled_time: "",
    doctor_notes: "",
    meeting_link: "",
  });
  const [confirmError, setConfirmError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, statusFilter, dateFrom, dateTo]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getMyDoctorAppointments({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
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

  const openConfirmModal = (appointment) => {
    setConfirmingAppointment(appointment);
    setConfirmForm({
      consultation_type: "physical",
      scheduled_time: appointment.appointment_time?.slice(0, 5) || "",
      doctor_notes: "",
      meeting_link: "",
    });
    setConfirmError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!confirmForm.scheduled_time) {
      setConfirmError("Please set a consultation time");
      return;
    }
    if (confirmForm.consultation_type === "online" && !confirmForm.meeting_link) {
      setConfirmError("Meeting link is required for online consultations");
      return;
    }

    try {
      setActionLoading(confirmingAppointment.appointment_id);
      setConfirmError(null);
      await appointmentAPI.confirmAppointment(
        confirmingAppointment.appointment_id,
        {
          consultation_type: confirmForm.consultation_type,
          scheduled_time: confirmForm.scheduled_time,
          doctor_notes: confirmForm.doctor_notes || undefined,
          meeting_link: confirmForm.consultation_type === "online" ? confirmForm.meeting_link : undefined,
        }
      );
      setShowConfirmModal(false);
      setConfirmingAppointment(null);
      fetchAppointments();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setConfirmError(errorInfo.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      await appointmentAPI.completeAppointment(appointmentId);
      fetchAppointments();
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (appointmentId) => {
    const reason = window.prompt("Please provide a reason for cancellation (optional):");
    if (reason === null) return;

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
    { value: APPOINTMENT_STATUS.ASSIGNED, label: "Assigned (Pending Confirmation)" },
    { value: APPOINTMENT_STATUS.CONFIRMED, label: "Confirmed" },
    { value: APPOINTMENT_STATUS.COMPLETED, label: "Completed" },
    { value: APPOINTMENT_STATUS.CANCELLED, label: "Cancelled" },
    { value: APPOINTMENT_STATUS.NO_SHOW, label: "No Show" },
  ];

  const getStatusAction = (appointment) => {
    const isLoading = actionLoading === appointment.appointment_id;

    if (appointment.status === APPOINTMENT_STATUS.ASSIGNED) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => openConfirmModal(appointment)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isLoading && (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Confirm
          </button>
          <button
            onClick={() => handleCancel(appointment.appointment_id)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>
      );
    }

    if (appointment.status === APPOINTMENT_STATUS.CONFIRMED) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleComplete(appointment.appointment_id)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isLoading && (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Complete
          </button>
          <button
            onClick={() => handleCancel(appointment.appointment_id)}
            disabled={isLoading}
            className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      );
    }

    return null;
  };

  // Calculate stats
  const stats = {
    assigned: appointments.filter((a) => a.status === APPOINTMENT_STATUS.ASSIGNED).length,
    confirmed: appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED).length,
    completed: appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    total: appointments.length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500">
            View and manage appointments assigned to you
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
            <p className="text-sm text-gray-500">Pending Confirmation</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Shown</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="To date"
            />
            {(statusFilter || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setDateFrom("");
                  setDateTo("");
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
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              <p className="text-sm text-gray-400 mt-1">
                Appointments assigned to you by pharmacies will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Pharmacy
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                            {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.Patient?.full_name || "Unknown Patient"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.Patient?.phone || appointment.Patient?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {formatDate(appointment.appointment_date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(appointment.appointment_time)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {appointment.Pharmacy?.pharmacy_name || "—"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.Pharmacy?.address}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {appointment.reason || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.consultation_type && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${
                            appointment.consultation_type === "online"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}>
                            {appointment.consultation_type === "online" ? (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                            )}
                            {appointment.consultation_type}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status?.replace("_", " ")}
                        </span>
                        {appointment.scheduled_time && appointment.scheduled_time !== appointment.appointment_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            Scheduled: {formatTime(appointment.scheduled_time)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getStatusAction(appointment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* Legend / Help */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Flow</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-600">
                <strong>Assigned</strong> — Waiting for your confirmation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">
                <strong>Confirmed</strong> — Ready for the appointment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-gray-600">
                <strong>Completed</strong> — Appointment finished
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Appointment Modal */}
      {showConfirmModal && confirmingAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Confirm Appointment</h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Appointment Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Patient Details</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {confirmingAppointment.Patient?.full_name || "Unknown Patient"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(confirmingAppointment.appointment_date)} at{" "}
                  {formatTime(confirmingAppointment.appointment_time)}
                </p>
                {confirmingAppointment.reason && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Reason:</span> {confirmingAppointment.reason}
                  </p>
                )}
              </div>

              {/* Error */}
              {confirmError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {confirmError}
                </div>
              )}

              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consultation Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmForm((prev) => ({ ...prev, consultation_type: "physical" }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      confirmForm.consultation_type === "physical"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <p className="font-semibold">Physical</p>
                    <p className="text-xs mt-1">In-person visit</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmForm((prev) => ({ ...prev, consultation_type: "online" }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      confirmForm.consultation_type === "online"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                    </svg>
                    <p className="font-semibold">Online</p>
                    <p className="text-xs mt-1">Video consultation</p>
                  </button>
                </div>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Time *
                </label>
                <input
                  type="time"
                  value={confirmForm.scheduled_time}
                  onChange={(e) => setConfirmForm((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Meeting Link (for online) */}
              {confirmForm.consultation_type === "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    value={confirmForm.meeting_link}
                    onChange={(e) => setConfirmForm((prev) => ({ ...prev, meeting_link: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Doctor Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes for Patient (optional)
                </label>
                <textarea
                  value={confirmForm.doctor_notes}
                  onChange={(e) => setConfirmForm((prev) => ({ ...prev, doctor_notes: e.target.value }))}
                  rows={3}
                  placeholder="e.g., Please bring your previous reports, fast before coming..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={actionLoading === confirmingAppointment?.appointment_id}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {actionLoading === confirmingAppointment?.appointment_id && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Appointments;