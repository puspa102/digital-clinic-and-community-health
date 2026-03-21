import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  appointmentAPI,
  handleApiError,
  formatDate,
  formatTime,
  getStatusBadgeClass,
} from "../../services/api";
import {
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  Activity,
} from "lucide-react";

const Records = () => {
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptError, setApptError] = useState(null);
  const [apptPagination, setApptPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [apptStatusFilter, setApptStatusFilter] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, [apptPagination.page, apptStatusFilter]);

  const fetchAppointments = async () => {
    try {
      setApptLoading(true);
      const params = {
        page: apptPagination.page,
        limit: apptPagination.limit,
      };
      if (apptStatusFilter) params.status = apptStatusFilter;

      const response = await appointmentAPI.getMyAppointments(params);
      setAppointments(response.data || []);
      const total = response.pagination?.totalItems || 0;
      setApptPagination((prev) => ({
        ...prev,
        total,
        totalPages: response.pagination?.totalPages || 0,
      }));
      // update stats
      setStats((prev) => ({ ...prev, totalAppointments: total }));
      if (!apptStatusFilter) {
        // Count completed from this page (approximate)
        const completed = (response.data || []).filter(
          (a) => a.status === "completed",
        ).length;
        setStats((prev) => ({ ...prev, completedAppointments: completed }));
      }
      setApptError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setApptError(errorInfo.message);
    } finally {
      setApptLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Medical History
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View your appointment history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-sky-600 dark:bg-sky-700 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-sky-100">Total Visits</p>
                <p className="text-xl font-bold text-white">
                  {stats.totalAppointments}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-600 dark:bg-emerald-700 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-100">Completed</p>
                <p className="text-xl font-bold text-white">
                  {stats.completedAppointments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={apptStatusFilter}
                onChange={(e) => {
                  setApptStatusFilter(e.target.value);
                  setApptPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Error */}
            {apptError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {apptError}
                </p>
              </div>
            )}

            {/* Loading */}
            {apptLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No appointments found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {apptStatusFilter
                    ? "Try changing the status filter."
                    : "Your appointment history will appear here."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div
                    key={appt.appointment_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg mt-0.5">
                          <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatDate(appt.appointment_date)}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(appt.appointment_time)}
                            </span>
                          </div>
                          {appt.reason && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Reason:</span>{" "}
                              {appt.reason}
                            </p>
                          )}
                          {appt.Pharmacy && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Pharmacy: {appt.Pharmacy.pharmacy_name}
                            </p>
                          )}
                          {appt.Doctor?.User && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Doctor: Dr. {appt.Doctor.User.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeClass(
                          appt.status,
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {apptPagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {apptPagination.page} of {apptPagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setApptPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={apptPagination.page <= 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() =>
                      setApptPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={apptPagination.page >= apptPagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Records;
