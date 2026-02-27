import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";
import {
  pharmacyAPI,
  getStatusBadgeClass,
  handleApiError,
} from "../../services/api";

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    pharmacy_name: "",
    address: "",
    license_number: "",
    latitude: "",
    longitude: "",
    opening_time: "",
    closing_time: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPharmacies();
  }, [pagination.page, searchTerm]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getAllPharmacies({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      });
      // API returns { success, data: [...], pagination: {...} }
      setPharmacies(response.data || []);
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
    if (!formData.full_name.trim()) errors.full_name = "Owner name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email";
    if (!formData.pharmacy_name.trim())
      errors.pharmacy_name = "Pharmacy name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.license_number.trim())
      errors.license_number = "License number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setCreating(true);
      const dataToSend = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
      };
      await pharmacyAPI.createPharmacy(dataToSend);
      setShowCreateModal(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        pharmacy_name: "",
        address: "",
        license_number: "",
        latitude: "",
        longitude: "",
        opening_time: "",
        closing_time: "",
        description: "",
      });
      fetchPharmacies();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setFormErrors({ submit: errorInfo.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePharmacy = async (pharmacyId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this pharmacy? This will also delete the associated user account.",
      )
    ) {
      return;
    }
    try {
      await pharmacyAPI.deletePharmacy(pharmacyId);
      fetchPharmacies();
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(errorInfo.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacies</h1>
            <p className="text-gray-500">
              Manage pharmacy accounts and profiles
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            Add Pharmacy
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search pharmacies..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Pharmacies List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <Loading message="Loading pharmacies..." color="purple" />
          ) : pharmacies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
              <p>No pharmacies found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-purple-600 hover:underline"
              >
                Create your first pharmacy
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Pharmacy
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Owner
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      License
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
                  {pharmacies.map((pharmacy) => (
                    <tr key={pharmacy.pharmacy_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {pharmacy.pharmacy_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {pharmacy.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {pharmacy.User?.full_name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {pharmacy.User?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">
                          {pharmacy.phone || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 font-mono text-sm">
                          {pharmacy.license_number}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(pharmacy.User?.status)}`}
                        >
                          {pharmacy.User?.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDeletePharmacy(pharmacy.pharmacy_id)
                          }
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Pharmacy
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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
              <p className="text-sm text-gray-500 mt-1">
                This will create a Pharmacy user account and profile
              </p>
            </div>

            <form onSubmit={handleCreatePharmacy} className="p-6 space-y-6">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}

              {/* Owner Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Owner Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        formErrors.full_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="John Doe"
                    />
                    {formErrors.full_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="pharmacy@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+977-9812345678"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Email Notification:</strong> A temporary password
                    will be automatically generated and sent to the pharmacy
                    owner's email address.
                  </p>
                </div>
              </div>

              {/* Pharmacy Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Pharmacy Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pharmacy Name *
                    </label>
                    <input
                      type="text"
                      name="pharmacy_name"
                      value={formData.pharmacy_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        formErrors.pharmacy_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="City Health Pharmacy"
                    />
                    {formErrors.pharmacy_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.pharmacy_name}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Kathmandu, Thamel"
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        formErrors.license_number
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="PH-NEP-12345"
                    />
                    {formErrors.license_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.license_number}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        name="opening_time"
                        value={formData.opening_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        name="closing_time"
                        value={formData.closing_time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of the pharmacy..."
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating && (
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
                  {creating ? "Creating..." : "Create Pharmacy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Pharmacies;
