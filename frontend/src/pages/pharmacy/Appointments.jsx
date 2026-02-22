import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  pharmacyAPI,
  getStatusBadgeClass,
  formatDate,
  formatTime,
  handleApiError,
  APPOINTMENT_STATUS,
} from "../../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Assign doctor modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [pagination.page, statusFilter, dateFrom, dateTo]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getMyAppointments({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
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

  const fetchDoctors = async () => {
    try {
      const response = await pharmacyAPI.getMyDoctors({ limit: 100 });
      setDoctors(response.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const handleOpenAssignModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDoctorId("");
    setAssignError(null);
    setShowAssignModal(true);
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) {
      setAssignError("Please select a doctor");
      return;
    }

    try {
      setAssigning(true);
      setAssignError(null);
      await pharmacyAPI.assignDoctorToAppointment(
        selectedAppointment.appointment_id,
        parseInt(selectedDoctorId)
      );
      setShowAssignModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setAssignError(errorInfo.message);
    } finally {
      setAssigning(false);
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

  const getStatusAction = (appointment) => {
    if (appointment.status === APPOINTMENT_STATUS.REQUESTED) {
      return (
        <button
          onClick={() => handleOpenAssignModal(appointment)}
          className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
        >
          Assign Doctor
        </button>
      );
    }
    if (appointment.status === APPOINTMENT_STATUS.ASSIGNED) {
      return (
        <span className="text-sm text-blue-600">Waiting for doctor confirmation</span>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage patient appointments at your pharmacy</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === APPOINTMENT_STATUS.REQUESTED).length}
            </p>
            <p className="text-sm text-gray-500">Pending Assignment</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === APPOINTMENT_STATUS.ASSIGNED).length}
            </p>
            <p className="text-sm text-gray-500">Awaiting Confirmation</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED).length}
            </p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-600">
              {appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                      Doctor
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {appointment.Patient?.full_name?.charAt(0)?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.Patient?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.Patient?.email}
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
                        {appointment.Doctor ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.Doctor?.User?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.Doctor?.specialization}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600 font-medium">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {appointment.reason || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status?.replace("_", " ")}
                        </span>
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
      </div>

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign Doctor</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Appointment for</p>
                <p className="font-medium text-gray-900">
                  {selectedAppointment.Patient?.full_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(selectedAppointment.appointment_date)} at{" "}
                  {formatTime(selectedAppointment.appointment_time)}
                </p>
                {selectedAppointment.reason && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Reason:</span>{" "}
                    {selectedAppointment.reason}
                  </p>
                )}
              </div>

              {/* Error */}
              {assignError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {assignError}
                </div>
              )}

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor *
                </label>
                {doctors.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No doctors available</p>
                    <a
                      href="/pharmacy/doctors"
                      className="text-orange-600 hover:underline text-sm"
                    >
                      Add a doctor first
                    </a>
                  </div>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.User?.full_name} - {doctor.specialization}
                        {doctor.consultation_fee
                          ? ` (Rs. ${doctor.consultation_fee})`
                          : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDoctor}
                  disabled={assigning || !selectedDoctorId}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {assigning && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
                  {assigning ? "Assigning..." : "Assign Doctor"}
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