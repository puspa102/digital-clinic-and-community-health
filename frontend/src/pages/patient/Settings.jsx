import { useState } from "react";
import Layout from "../../components/Layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Sun, Moon, Bell, Shield, User, Mail, Lock, Heart } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("general");

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("patientNotificationSettings");
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          appointmentReminders: true,
          prescriptionUpdates: true,
          healthTips: false,
        };
  });

  // Preferences state
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("patientPreferences");
    return saved
      ? JSON.parse(saved)
      : {
          language: "en",
          timezone: "Asia/Kathmandu",
          dateFormat: "YYYY-MM-DD",
        };
  });

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: isDark ? Moon : Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem("patientPreferences", JSON.stringify(preferences));
    setSaveSuccess("Preferences saved successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("patientNotificationSettings", JSON.stringify(notifications));
    setSaveSuccess("Notification settings saved successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError("Password must contain uppercase, lowercase, and a number");
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Save Success Toast */}
        {saveSuccess && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{saveSuccess}</p>
          </div>
        )}

        {/* Settings Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">

              {/* General Settings */}
              {activeTab === "general" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      General Settings
                    </h2>
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {user?.full_name || "Patient"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded-full mt-1">
                          Patient
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.full_name || ""}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          defaultValue={user?.email || ""}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      Preferences
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange("language", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="en">English</option>
                          <option value="ne">Nepali</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="Asia/Kathmandu">Nepal Time (UTC+5:45)</option>
                          <option value="Asia/Kolkata">India Time (UTC+5:30)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date Format
                        </label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSavePreferences}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Appearance
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customize how the application looks
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Theme
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => isDark && toggleTheme()}
                        className={`p-6 border-2 rounded-lg transition-all ${
                          !isDark
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Sun className="w-8 h-8 text-yellow-500" />
                          {!isDark && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Light Mode
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Clean and bright interface
                        </p>
                      </button>

                      <button
                        onClick={() => !isDark && toggleTheme()}
                        className={`p-6 border-2 rounded-lg transition-all ${
                          isDark
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Moon className="w-8 h-8 text-indigo-500" />
                          {isDark && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Dark Mode
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Easy on the eyes at night
                        </p>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Moon className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Current Theme
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isDark ? "Dark Mode" : "Light Mode"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          isDark ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            isDark ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage how you receive notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive email notifications for important updates",
                      },
                      {
                        key: "appointmentReminders",
                        label: "Appointment Reminders",
                        desc: "Get reminders before your upcoming appointments",
                      },
                      {
                        key: "prescriptionUpdates",
                        label: "Prescription Updates",
                        desc: "Notifications when your prescriptions are updated",
                      },
                      {
                        key: "healthTips",
                        label: "Health Tips",
                        desc: "Receive weekly health tips and wellness reminders",
                      },
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications[key] ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications[key] ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveNotifications}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Security
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your security settings and password
                    </p>
                  </div>

                  {/* Success / Error */}
                  {passwordSuccess && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{passwordSuccess}</p>
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Change Password
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Password requirements:</strong> At least 8 characters,
                        including uppercase, lowercase, and a number.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Enable 2FA
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
