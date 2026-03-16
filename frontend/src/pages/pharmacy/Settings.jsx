import { useState } from "react";
import Layout from "../../components/Layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import {
  Sun,
  Moon,
  Bell,
  Shield,
  Mail,
  Lock,
  Phone,
  Globe,
  Clock,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Palette,
  Pill,
  Package,
  AlertTriangle,
} from "lucide-react";

const Settings = () => {
  const { toggleTheme, isDark } = useTheme();
  const { user } = useAuth();

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("pharmacyNotificationSettings");
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          orderAlerts: true,
          lowStockAlerts: true,
          expiryAlerts: true,
        };
  });

  // Preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("pharmacyPreferences");
    return saved
      ? JSON.parse(saved)
      : {
          language: "en",
          timezone: "Asia/Kathmandu",
          dateFormat: "YYYY-MM-DD",
          lowStockThreshold: "10",
          expiryWarningDays: "30",
        };
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("pharmacyNotificationSettings", JSON.stringify(updated));
    showToast("Notification settings updated");
  };

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem("pharmacyPreferences", JSON.stringify(updated));
    showToast("Preferences updated");
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
      setPasswordError(
        "Password must contain uppercase, lowercase, and a number"
      );
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive important updates via email",
      icon: Mail,
    },
    {
      key: "orderAlerts",
      title: "Order Alerts",
      description: "Get notified about new orders",
      icon: Package,
    },
    {
      key: "lowStockAlerts",
      title: "Low Stock Alerts",
      description: "Notifications when items run low",
      icon: AlertTriangle,
    },
    {
      key: "expiryAlerts",
      title: "Expiry Alerts",
      description: "Alerts for items nearing expiry",
      icon: Clock,
    },
  ];

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
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your pharmacy settings and preferences
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-semibold">{user?.full_name}</h2>
                <p className="text-teal-100">{user?.role}</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => isDark && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all ${
                !isDark
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-xl">
                <Sun className="w-6 h-6 text-amber-500" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Light</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Clean & bright
              </p>
            </button>

            <button
              onClick={() => !isDark && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all ${
                isDark
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                <Moon className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">Dark</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Easy on eyes
              </p>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Preferences
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Regional and inventory settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange("language", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ne">नेपाली (Nepali)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="Asia/Kathmandu">Nepal (UTC+5:45)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">India (UTC+5:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Low Stock Threshold
              </label>
              <select
                value={preferences.lowStockThreshold}
                onChange={(e) => handlePreferenceChange("lowStockThreshold", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="5">5 units</option>
                <option value="10">10 units</option>
                <option value="20">20 units</option>
                <option value="50">50 units</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Warning Days
              </label>
              <select
                value={preferences.expiryWarningDays}
                onChange={(e) => handlePreferenceChange("expiryWarningDays", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose what you want to be notified about
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notificationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(option.key)}
                    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                      notifications[option.key]
                        ? "bg-teal-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifications[option.key]
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Security
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your password
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </p>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400">
                {passwordSuccess}
              </p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                Password must be at least 8 characters with uppercase, lowercase,
                and a number.
              </p>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium rounded-xl transition-colors"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
