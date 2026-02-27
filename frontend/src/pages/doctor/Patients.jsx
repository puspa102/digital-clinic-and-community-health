import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  authAPI,
  appointmentAPI,
  prescriptionAPI,
  handleApiError,
  formatDate,
  formatTime,
  getStatusBadgeClass,
  APPOINTMENT_STATUS,
} from "../../services/api";
import {
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Activity,
  FileText,
} from "lucide-react";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // View patient detail
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailTab, setDetailTab] = useState("appointments");
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [pagination.page, search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;

      const response = await authAPI.getPatients(params);
      setPatients(response.data || []);
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

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    setDetailTab("appointments");
    setDetailLoading(true);
    try {
      const [apptRes, prescRes] = await Promise.all([
        appointmentAPI.getPatientAppointments(patient.user_id, { limit: 50 }),
        prescriptionAPI.getPatientPrescriptions(patient.user_id, { limit: 50 }),
      ]);
      setPatientAppointments(apptRes.data || []);
      setPatientPrescriptions(prescRes.data || []);
    } catch (err) {
      console.error("Failed to load patient details:", err);
      setPatientAppointments([]);
      setPatientPrescriptions([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedPatient(null);
    setPatientAppointments([]);
    setPatientPrescriptions([]);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Patients
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage your patients
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No patients found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search
                ? "Try adjusting your search criteria."
                : "Patients will appear here once they are registered."}
            </p>
          </div>
        ) : (
          <>
            {/* Patients Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {patients.map((patient) => (
                      <tr
                        key={patient.user_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {patient.full_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {patient.user_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{patient.email}</span>
                            </div>
                            {patient.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                              patient.status
                            )}`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(patient.created_at || patient.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} patients)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedPatient.full_name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedPatient.email}
                      </span>
                      {selectedPatient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedPatient.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                <button
                  onClick={() => setDetailTab("appointments")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    detailTab === "appointments"
                      ? "border-green-600 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Appointments ({patientAppointments.length})
                  </span>
                </button>
                <button
                  onClick={() => setDetailTab("prescriptions")}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    detailTab === "prescriptions"
                      ? "border-green-600 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Prescriptions ({patientPrescriptions.length})
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {detailLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  </div>
                ) : detailTab === "appointments" ? (
                  <div className="space-y-3">
                    {patientAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No appointment records found
                        </p>
                      </div>
                    ) : (
                      patientAppointments.map((appt) => (
                        <div
                          key={appt.appointment_id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(appt.appointment_date)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                at {formatTime(appt.appointment_time)}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                appt.status
                              )}`}
                            >
                              {appt.status}
                            </span>
                          </div>
                          {appt.reason && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <span className="font-medium">Reason:</span> {appt.reason}
                            </p>
                          )}
                          {appt.Pharmacy && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span className="font-medium">Pharmacy:</span>{" "}
                              {appt.Pharmacy.pharmacy_name}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientPrescriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No prescriptions found
                        </p>
                      </div>
                    ) : (
                      patientPrescriptions.map((presc) => (
                        <div
                          key={presc.prescription_id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              RX-{String(presc.prescription_id).padStart(4, "0")}
                            </h4>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                presc.status
                              )}`}
                            >
                              {presc.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {presc.diagnosis}
                          </p>
                          {presc.PrescriptionItems && presc.PrescriptionItems.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Medicines ({presc.PrescriptionItems.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {presc.PrescriptionItems.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded"
                                  >
                                    {item.medicine_name} — {item.dosage}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatDate(presc.created_at || presc.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
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

export default Patients;
