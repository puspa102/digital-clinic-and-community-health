import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Building2,
  Clock,
  Check,
  Pill,
  Globe,
  FileText,
  Users,
  Calendar,
  Camera,
  Store,
} from "lucide-react";
import api, { handleApiError } from "../../services/api";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [pharmacyProfile, setPharmacyProfile] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    totalInventoryItems: 0,
  });
  const [formData, setFormData] = useState({
    pharmacy_name: "",
    email: "",
    phone: "",
    address: "",
    license_number: "",
    operating_hours: "",
    description: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPharmacyProfile();
    fetchStats();
  }, []);

  const fetchPharmacyProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pharmacies/me");
      const pharmacy = response.data.data;
      setPharmacyProfile(pharmacy);

      setFormData({
        pharmacy_name: pharmacy.pharmacy_name || "",
        email: pharmacy.User?.email || "",
        phone: pharmacy.User?.phone || "",
        address: pharmacy.address || "",
        license_number: pharmacy.license_number || "",
        operating_hours: pharmacy.operating_hours || "",
        description: pharmacy.description || "",
      });
      setPreviewImage(
        pharmacy.User?.profile_picture
          ? `http://localhost:5000/${pharmacy.User.profile_picture}`
          : null,
      );
      setRemoveImage(false);
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch doctors count
      const doctorsRes = await api.get("/pharmacies/doctors");
      const appointmentsRes = await api.get("/appointments");
      const inventoryRes = await api.get("/inventory");

      setStats({
        totalDoctors: doctorsRes.data.data?.length || 0,
        totalAppointments: appointmentsRes.data.data?.length || 0,
        totalInventoryItems: inventoryRes.data.data?.length || 0,
      });
    } catch (err) {
      // Silent fail for stats
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setProfileImage(null);
    setPreviewImage(null);
    setRemoveImage(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update User Profile (Image, Phone)
      const userFormData = new FormData();
      userFormData.append("phone", formData.phone);
      if (profileImage) {
        userFormData.append("profile_picture", profileImage);
      }
      if (removeImage) {
        userFormData.append("remove_profile_picture", "true");
      }

      await api.put("/auth/profile", userFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2. Update Pharmacy Profile
      const updateData = {
        pharmacy_name: formData.pharmacy_name,
        address: formData.address,
        license_number: formData.license_number,
        operating_hours: formData.operating_hours,
        description: formData.description,
      };

      await api.put(`/pharmacies/${pharmacyProfile.pharmacy_id}`, updateData);
      showToast("Profile updated successfully!");
      setIsEditing(false);
      setProfileImage(null);
      setRemoveImage(false);
      fetchPharmacyProfile();
      if (refreshUser) refreshUser();
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (pharmacyProfile) {
      setFormData({
        pharmacy_name: pharmacyProfile.pharmacy_name || "",
        email: pharmacyProfile.User?.email || "",
        phone: pharmacyProfile.User?.phone || "",
        address: pharmacyProfile.address || "",
        license_number: pharmacyProfile.license_number || "",
        operating_hours: pharmacyProfile.operating_hours || "",
        description: pharmacyProfile.description || "",
      });
      setPreviewImage(
        pharmacyProfile.User?.profile_picture
          ? `http://localhost:5000/${pharmacyProfile.User.profile_picture}`
          : null,
      );
      setProfileImage(null);
      setRemoveImage(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-teal-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pharmacy Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your pharmacy information
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-10 h-10 text-white" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-4 flex gap-1">
                    <label className="p-1.5 bg-white text-blue-600 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    {previewImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 bg-white text-red-500 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-semibold">
                  {formData.pharmacy_name || "Pharmacy Name"}
                </h2>
                <p className="text-teal-100 mt-1">{user?.role || "Pharmacy"}</p>
                {formData.license_number && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                      <FileText className="w-4 h-4" />
                      License: {formData.license_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formData.email || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.phone || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formData.address || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hours
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formData.operating_hours || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDoctors}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Doctors
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAppointments}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Appointments
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalInventoryItems}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Inventory Items
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pharmacy Information Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Pharmacy Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your pharmacy details and contact information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pharmacy Name *
                </label>
                <input
                  type="text"
                  name="pharmacy_name"
                  value={formData.pharmacy_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operating Hours
                </label>
                <input
                  type="text"
                  name="operating_hours"
                  value={formData.operating_hours}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., 9:00 AM - 9:00 PM"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-none"
                placeholder="Brief description about your pharmacy, services offered..."
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-xl transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Description Display */}
        {formData.description && !isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  About Us
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pharmacy description
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {formData.description}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
