import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  FileText,
  Edit2,
  Save,
  X,
  Building2,
  Stethoscope,
  Clock,
  Check,
  BadgeCheck,
  Banknote,
} from "lucide-react";
import api, { handleApiError } from "../../services/api";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    license_number: "",
    experience_years: "",
    hospital_name: "",
    bio: "",
    consultation_fee: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors/me");
      setDoctorProfile(response.data.data);

      const profile = response.data.data;
      setFormData({
        full_name: profile.User?.full_name || "",
        email: profile.User?.email || "",
        phone: profile.User?.phone || "",
        specialization: profile.specialization || "",
        license_number: profile.license_number || "",
        experience_years: profile.experience_years || "",
        hospital_name: profile.hospital_name || "",
        bio: profile.bio || "",
        consultation_fee: profile.consultation_fee || "",
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message, "error");
    } finally {
      setLoading(false);
    }
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
      const updateData = {
        specialization: formData.specialization,
        license_number: formData.license_number,
        experience_years: parseInt(formData.experience_years),
        hospital_name: formData.hospital_name,
        bio: formData.bio,
        consultation_fee: formData.consultation_fee
          ? parseFloat(formData.consultation_fee)
          : null,
      };

      await api.put(`/doctors/${doctorProfile.doctor_id}`, updateData);
      showToast("Profile updated successfully!");
      setIsEditing(false);
      fetchDoctorProfile();
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (doctorProfile) {
      setFormData({
        full_name: doctorProfile.User?.full_name || "",
        email: doctorProfile.User?.email || "",
        phone: doctorProfile.User?.phone || "",
        specialization: doctorProfile.specialization || "",
        license_number: doctorProfile.license_number || "",
        experience_years: doctorProfile.experience_years || "",
        hospital_name: doctorProfile.hospital_name || "",
        bio: doctorProfile.bio || "",
        consultation_fee: doctorProfile.consultation_fee || "",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
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
                ? "bg-green-500 text-white"
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
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your professional information
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-semibold">
                  Dr. {formData.full_name || "Doctor Name"}
                </h2>
                <p className="text-green-100 mt-1">
                  {formData.specialization || "Specialization"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    {formData.experience_years || 0} Years Experience
                  </span>
                </div>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.phone || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hospital</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.hospital_name || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Banknote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Consultation Fee</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.consultation_fee ? `Rs. ${formData.consultation_fee}` : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pharmacy Info */}
        {doctorProfile?.Pharmacy && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Working At
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your affiliated pharmacy
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-white">
                {doctorProfile.Pharmacy.pharmacy_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {doctorProfile.Pharmacy.address}
              </p>
            </div>
          </div>
        )}

        {/* Professional Information Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Professional Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your professional details and qualifications
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-not-allowed"
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
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consultation Fee (Rs.)
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  step="0.01"
                  placeholder="500.00"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-none"
                placeholder="Write a brief professional bio about yourself..."
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl transition-colors font-medium"
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

        {/* Bio Display */}
        {formData.bio && !isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  About Me
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional biography
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {formData.bio}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
