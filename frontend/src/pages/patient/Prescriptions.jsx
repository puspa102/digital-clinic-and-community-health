import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  prescriptionAPI,
  handleApiError,
  formatDate,
  getStatusBadgeClass,
} from "../../services/api";
import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pill,
  ClipboardList,
  Eye,
  X,
} from "lucide-react";

const Prescriptions = () => {
  const { user } = useAuth();

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  // View prescription detail
  const [viewPrescription, setViewPrescription] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    activePrescriptions: 0,
  });

  useEffect(() => {
    fetchPrescriptions();
  }, [pagination.page, statusFilter]);

  const fetchPrescriptions = async () => {
    if (!user?.user_id && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const patientId = user.user_id || user.id;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await prescriptionAPI.getPatientPrescriptions(
        patientId,
        params,
      );
      setPrescriptions(response.data || []);
      const total = response.pagination?.totalItems || 0;
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages: response.pagination?.totalPages || 0,
      }));
      setStats((prev) => ({ ...prev, totalPrescriptions: total }));
      if (!statusFilter) {
        const active = (response.data || []).filter(
          (p) => p.status === "active",
        ).length;
        setStats((prev) => ({ ...prev, activePrescriptions: active }));
      }
      setError(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Prescriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage your prescriptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-violet-600 dark:bg-violet-700 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-violet-100">Total Prescriptions</p>
                <p className="text-xl font-bold text-white">
                  {stats.totalPrescriptions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-500 dark:bg-amber-600 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-100">Active Rx</p>
                <p className="text-xl font-bold text-white">
                  {stats.activePrescriptions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No prescriptions found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {statusFilter
                  ? "Try changing the status filter."
                  : "Your prescriptions will appear here after a doctor visit."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((presc) => (
                <div
                  key={presc.prescription_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
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
                                  className="px-2 py-0.5 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded"
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
                          presc.status,
                        )}`}
                      >
                        {presc.status}
                      </span>
                      <button
                        onClick={() => setViewPrescription(presc)}
                        className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg"
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prescription Detail Modal */}
        {viewPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Prescription RX-
                    {String(viewPrescription.prescription_id).padStart(4, "0")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(
                      viewPrescription.created_at || viewPrescription.createdAt,
                    )}
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
                        viewPrescription.status,
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
                              <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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

export default Prescriptions;
