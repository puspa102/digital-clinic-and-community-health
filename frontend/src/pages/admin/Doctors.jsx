import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import { doctorAPI, authAPI, handleApiError, getStatusBadgeClass, formatDateTime } from "../../services/api";

const Doctors = () => {
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
  const [filters, setFilters] = useState({
    specialization: "",
    search: "",
  });

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.specialization) params.specialization = filters.specialization;

      const response = await doctorAPI.getAllDoctors(params);
      console.log("Doctors API Response:", response);

      if (response.success) {
        const doctorsData = response.data || [];
        console.log("Doctors data:", doctorsData);
        setDoctors(doctorsData);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      } else {
        setError(response.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Doctors API Error:", err);
      const errorData = handleApiError(err);
      setError(errorData.message || "Failed to connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.specialization]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDoctor = async (doctorId) => {
    try {
      setActionLoading(true);
      const response = await doctorAPI.getDoctorById(doctorId);
      if (response.success) {
        setSelectedDoctor(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUserStatus = async (status) => {
    if (!selectedDoctor?.User?.user_id) return;

    try {
      setActionLoading(true);
      const response = await authAPI.updateUserStatus(selectedDoctor.User.user_id, status);
      if (response.success) {
        setShowStatusModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      setActionLoading(true);
      const response = await doctorAPI.deleteDoctor(selectedDoctor.doctor_id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
      }
    } catch (err) {
      const errorData = handleApiError(err);
      alert(errorData.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowStatusModal(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  // Filter doctors by search term (client-side)
  const filteredDoctors = doctors.filter((doctor) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      doctor.User?.full_name?.toLowerCase().includes(searchLower) ||
      doctor.User?.email?.toLowerCase().includes(searchLower) ||
      doctor.specialization?.toLowerCase().includes(searchLower) ||
      doctor.hospital_name?.toLowerCase().includes(searchLower) ||
      doctor.license_number?.toLowerCase().includes(searchLower)
    );
  });

  // Common specializations for filter dropdown
  const specializations = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
    "Psychiatrist",
    "Gynecologist",
    "ENT Specialist",
    "Ophthalmologist",
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600 mt-1">View and manage all registered doctors.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Total: <span className="font-semibold">{pagination.total}</span> doctors
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, license..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange("specialization", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Placeholder for alignment */}
            <div className="hidden lg:block"></div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ specialization: "", search: "" });
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
              onClick={fetchDoctors}
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
            {/* Doctors Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pharmacy
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDoctors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No doctors found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <tr key={doctor.doctor_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                {doctor.User?.full_name?.charAt(0)?.toUpperCase() || "D"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doctor.User?.full_name || "Unknown"}</p>
                                <p className="text-sm text-gray-500">{doctor.User?.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {doctor.specialization}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {doctor.experience_years} years
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(doctor.User?.status)}`}
                            >
                              {doctor.User?.status || "unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {doctor.Pharmacy?.pharmacy_name || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDoctor(doctor.doctor_id)}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openStatusModal(doctor)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Change Status"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(doctor)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Doctor"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
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

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Doctor Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedDoctor(null);
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
              {/* Doctor Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                  {selectedDoctor.User?.full_name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDoctor.User?.full_name}</h3>
                  <p className="text-gray-500">{selectedDoctor.User?.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(selectedDoctor.User?.status)}`}>
                    {selectedDoctor.User?.status}
                  </span>
                </div>
              </div>

              {/* Doctor Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedDoctor.specialization}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedDoctor.license_number}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedDoctor.experience_years} years</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedDoctor.consultation_fee ? `Rs. ${selectedDoctor.consultation_fee}` : "Not set"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Hospital/Clinic</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedDoctor.hospital_name || "Not specified"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedDoctor.User?.phone || "Not provided"}</p>
                </div>
              </div>

              {/* Pharmacy Information */}
              {selectedDoctor.Pharmacy && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Associated Pharmacy</h4>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedDoctor.Pharmacy.pharmacy_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedDoctor.Pharmacy.address}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.Pharmacy.phone}</p>
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedDoctor.bio && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-600">{selectedDoctor.bio}</p>
                </div>
              )}

              {/* Dates */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  Registered on: <span className="font-medium text-gray-700">{formatDateTime(selectedDoctor.created_at)}</span>
                </p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openStatusModal(selectedDoctor);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Status
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDoctor(null);
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
      {showStatusModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Change Doctor Status</h2>
              <p className="text-gray-500 mt-1">Update status for {selectedDoctor.User?.full_name}</p>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Current status: <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(selectedDoctor.User?.status)}`}>{selectedDoctor.User?.status}</span>
              </p>
              <button
                onClick={() => handleUpdateUserStatus("approved")}
                disabled={actionLoading || selectedDoctor.User?.status === "approved"}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Approve Doctor</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={() => handleUpdateUserStatus("pending")}
                disabled={actionLoading || selectedDoctor.User?.status === "pending"}
                className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Set as Pending</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
              <button
                onClick={() => handleUpdateUserStatus("blocked")}
                disabled={actionLoading || selectedDoctor.User?.status === "blocked"}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Block Doctor</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </button>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedDoctor(null);
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">Delete Doctor</h2>
              <p className="text-gray-500 text-center mt-2">
                Are you sure you want to delete <span className="font-semibold">{selectedDoctor.User?.full_name}</span>? This will also delete their user account. This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDoctor(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Doctor"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Doctors;