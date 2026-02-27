import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  appointmentAPI,
  prescriptionAPI,
  handleApiError,
  formatDate,
  formatTime,
  getStatusBadgeClass,
} from "../../services/api";
import {
  Calendar,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pill,
  Stethoscope,
  Activity,
  ClipboardList,
  Eye,
  X,
} from "lucide-react";

const Records = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");

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

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(true);
  const [prescError, setPrescError] = useState(null);
  const [prescPagination, setPrescPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [prescStatusFilter, setPrescStatusFilter] = useState("");

  // View prescription detail
  const [viewPrescription, setViewPrescription] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, [apptPagination.page, apptStatusFilter]);

  useEffect(() => {
    fetchPrescriptions();
  }, [prescPagination.page, prescStatusFilter]);

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
          (a) => a.status === "completed"
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

  const fetchPrescriptions = async () => {
    if (!user?.user_id && !user?.id) {
      setPrescLoading(false);
      return;
    }
    try {
      setPrescLoading(true);
      const patientId = user.user_id || user.id;
      const params = {
        page: prescPagination.page,
        limit: prescPagination.limit,
      };
      if (prescStatusFilter) params.status = prescStatusFilter;

      const response = await prescriptionAPI.getPatientPrescriptions(
        patientId,
        params
      );
      setPrescriptions(response.data || []);
      const total = response.pagination?.totalItems || 0;
      setPrescPagination((prev) => ({
        ...prev,
        total,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setStats((prev) => ({ ...prev, totalPrescriptions: total }));
      if (!prescStatusFilter) {
        const active = (response.data || []).filter(
          (p) => p.status === "active"
        ).length;
        setStats((prev) => ({ ...prev, activePrescriptions: active }));
      }
      setPrescError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setPrescError(errorInfo.message);
    } finally {
      setPrescLoading(false);
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
            View your appointment history and prescriptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Visits</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalAppointments}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.completedAppointments}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Prescriptions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalPrescriptions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Pill className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Rx</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.activePrescriptions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 -mb-px transition-colors ${
                activeTab === "appointments"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </span>
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 -mb-px transition-colors ${
                activeTab === "prescriptions"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Prescriptions
              </span>
            </button>
          </div>

          <div className="p-4">
            {/* ===== Appointments Tab ===== */}
            {activeTab === "appointments" && (
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
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
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
                    <p className="text-sm text-red-800 dark:text-red-200">{apptError}</p>
                  </div>
                )}

                {/* Loading */}
                {apptLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-0.5">
                              <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                                  <span className="font-medium">Reason:</span> {appt.reason}
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
                              appt.status
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
            )}

            {/* ===== Prescriptions Tab ===== */}
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={prescStatusFilter}
                    onChange={(e) => {
                      setPrescStatusFilter(e.target.value);
                      setPrescPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Error */}
                {prescError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{prescError}</p>
                  </div>
                )}

                {/* Loading */}
                {prescLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      No prescriptions found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {prescStatusFilter
                        ? "Try changing the status filter."
                        : "Your prescriptions will appear here after a doctor visit."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((presc) => (
                      <div
                        key={presc.prescription_id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mt-0.5">
                              <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  RX-{String(presc.prescription_id).padStart(4, "0")}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(presc.created_at || presc.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Diagnosis:</span>{" "}
                                {presc.diagnosis}
                              </p>
                              {presc.Doctor?.User && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Prescribed by: Dr. {presc.Doctor.User.full_name}
                                </p>
                              )}
                              {presc.PrescriptionItems &&
                                presc.PrescriptionItems.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {presc.PrescriptionItems.map((item, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                                      >
                                        {item.medicine_name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeClass(
                                presc.status
                              )}`}
                            >
                              {presc.status}
                            </span>
                            <button
                              onClick={() => setViewPrescription(presc)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {prescPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Page {prescPagination.page} of {prescPagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setPrescPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                        disabled={prescPagination.page <= 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() =>
                          setPrescPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                        disabled={
                          prescPagination.page >= prescPagination.totalPages
                        }
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prescription Detail Modal */}
        {viewPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Prescription RX-{String(viewPrescription.prescription_id).padStart(4, "0")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(viewPrescription.created_at || viewPrescription.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setViewPrescription(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                        viewPrescription.status
                      )}`}
                    >
                      {viewPrescription.status}
                    </span>
                  </div>
                  {viewPrescription.Doctor?.User && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Doctor
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        Dr. {viewPrescription.Doctor.User.full_name}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Diagnosis
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {viewPrescription.diagnosis}
                  </p>
                </div>

                {viewPrescription.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Notes
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {viewPrescription.notes}
                    </p>
                  </div>
                )}

                {/* Medicines */}
                {viewPrescription.PrescriptionItems &&
                  viewPrescription.PrescriptionItems.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Medicines
                      </p>
                      <div className="space-y-2">
                        {viewPrescription.PrescriptionItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.medicine_name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300">
                              <span>Dosage: {item.dosage}</span>
                              <span>Frequency: {item.frequency}</span>
                              <span>Duration: {item.duration}</span>
                              {item.quantity && (
                                <span>Qty: {item.quantity}</span>
                              )}
                            </div>
                            {item.instructions && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Instructions: {item.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Records;
