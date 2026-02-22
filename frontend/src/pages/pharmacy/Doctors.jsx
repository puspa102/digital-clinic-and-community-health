import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { pharmacyAPI, getStatusBadgeClass, handleApiError } from "../../services/api";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [specialization, setSpecialization] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    license_number: "",
    experience_years: "",
    hospital_name: "",
    bio: "",
    consultation_fee: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, [pagination.page, specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getMyDoctors({
        page: pagination.page,
        limit: pagination.limit,
        specialization: specialization || undefined,
      });
      // API returns { success, data: [...], pagination: {...} }
      setDoctors(response.data || []);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      errors.password = "Password must contain uppercase, lowercase, and number";
    if (!formData.specialization.trim()) errors.specialization = "Specialization is required";
    if (!formData.license_number.trim()) errors.license_number = "License number is required";
    if (!formData.experience_years) errors.experience_years = "Experience is required";
    else if (isNaN(formData.experience_years) || parseInt(formData.experience_years) < 0)
      errors.experience_years = "Invalid experience years";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setCreating(true);
      const dataToSend = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : undefined,
      };
      await pharmacyAPI.createDoctor(dataToSend);
      setShowCreateModal(false);
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        license_number: "",
        experience_years: "",
        hospital_name: "",
        bio: "",
        consultation_fee: "",
      });
      fetchDoctors();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setFormErrors({ submit: errorInfo.message });
    } finally {
      setCreating(false);
    }
  };

  const specializations = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Orthopedist",
    "Gynecologist",
    "Psychiatrist",
    "ENT Specialist",
    "Ophthalmologist",
    "Other",
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Doctors</h1>
            <p className="text-gray-500">Manage doctors working at your pharmacy</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Doctor
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Doctors List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p>No doctors found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-orange-600 hover:underline"
              >
                Add your first doctor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {doctors.map((doctor) => (
                <div key={doctor.doctor_id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-lg">
                      {doctor.User?.full_name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{doctor.User?.full_name}</h3>
                      <p className="text-sm text-orange-600">{doctor.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">{doctor.experience_years} years experience</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(doctor.User?.status)}`}>
                      {doctor.User?.status}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">License</span>
                      <span className="text-gray-900 font-mono">{doctor.license_number}</span>
                    </div>
                    {doctor.consultation_fee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Consultation Fee</span>
                        <span className="text-gray-900">Rs. {doctor.consultation_fee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email</span>
                      <span className="text-gray-900 truncate ml-2">{doctor.User?.email}</span>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Doctor</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Create a doctor account linked to your pharmacy
              </p>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-6">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}

              {/* Account Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.full_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Dr. John Doe"
                    />
                    {formErrors.full_name && <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="doctor@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Min 8 characters"
                    />
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+977-9812345678"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.specialization ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {formErrors.specialization && <p className="text-red-500 text-xs mt-1">{formErrors.specialization}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.license_number ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="DOC-NEP-12345"
                    />
                    {formErrors.license_number && <p className="text-red-500 text-xs mt-1">{formErrors.license_number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      min="0"
                      max="70"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formErrors.experience_years ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="5"
                    />
                    {formErrors.experience_years && <p className="text-red-500 text-xs mt-1">{formErrors.experience_years}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (Rs.)</label>
                    <input
                      type="number"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic Name</label>
                    <input
                      type="text"
                      name="hospital_name"
                      value={formData.hospital_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="City Medical Center"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Brief professional background..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {creating ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Doctors;