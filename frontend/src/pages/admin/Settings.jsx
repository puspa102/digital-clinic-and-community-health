import { useState } from "react";
import Layout from "../../components/Layout";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Sun, Moon, Bell, Shield, User, Mail, Lock } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
    weeklyReports: false,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: isDark ? Moon : Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.full_name || ""}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.role || ""}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        readOnly
                      />
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
                          onChange={(e) =>
                            handlePreferenceChange("language", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) =>
                            handlePreferenceChange("timezone", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="CST">Central Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date Format
                        </label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) =>
                            handlePreferenceChange("dateFormat", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time Format
                        </label>
                        <select
                          value={preferences.timeFormat}
                          onChange={(e) =>
                            handlePreferenceChange("timeFormat", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="12h">12 Hour</option>
                          <option value="24h">24 Hour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                      Customize how the application looks and feels
                    </p>
                  </div>

                  {/* Theme Switcher */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                      Theme
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Theme Card */}
                      <button
                        onClick={() => !isDark && toggleTheme()}
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
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
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

                      {/* Dark Theme Card */}
                      <button
                        onClick={() => isDark && toggleTheme()}
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
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
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

                    {/* Quick Toggle */}
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
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {key === "emailNotifications" &&
                              "Receive email notifications for important updates"}
                            {key === "appointmentReminders" &&
                              "Get reminders for upcoming appointments"}
                            {key === "systemAlerts" &&
                              "Receive system alerts and updates"}
                            {key === "weeklyReports" &&
                              "Get weekly summary reports via email"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            value ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

                  {/* Change Password */}
                  <div className="space-y-4">
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Password requirements:</strong> At least 8
                        characters, including uppercase, lowercase, and a
                        number.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>

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
