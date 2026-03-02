import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Get role-specific colors
  const getRoleColor = () => {
    const colors = {
      Admin: "bg-purple-600",
      Doctor: "bg-green-600",
      Patient: "bg-blue-600",
      Pharmacy: "bg-orange-600",
    };
    return colors[user?.role] || "bg-blue-600";
  };

  const roleColor = getRoleColor();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Page title - Mobile */}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 lg:hidden">
          Digital Clinic
        </h1>

        {/* Search bar - Desktop only */}
        {isAuthenticated && (
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Messages - for Doctor and Patient */}
              {(user?.role === "Doctor" || user?.role === "Patient") && (
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                  <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button>
              )}

              {/* Admin Quick Actions */}
              {user?.role === "Admin" && (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/admin/users"
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Users
                  </Link>
                  {/* <Link
                    to="/admin/reports"
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Reports
                  </Link>*/}
                </div>
              )}

              {/* Profile Dropdown - Desktop */}
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </p>
                </div>
                <div className="relative group">
                  <button
                    className={`w-10 h-10 ${roleColor} rounded-full flex items-center justify-center text-white font-semibold`}
                  >
                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to={`/${user?.role?.toLowerCase()}/profile`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        to={`/${user?.role?.toLowerCase()}/settings`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Profile Avatar */}
              <div className="lg:hidden">
                <div
                  className={`w-10 h-10 ${roleColor} rounded-full flex items-center justify-center text-white font-semibold`}
                >
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Guest header actions */}
              {/* Theme Switcher for guests */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </button>

              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>

              {/* Mobile - just show login button */}
              <Link
                to="/login"
                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Role-specific sub-navigation bar for certain roles */}
      {/* {isAuthenticated && user?.role === "Admin" && (
        <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-gray-50 border-t">
          <span className="text-xs text-gray-500 mr-2">Quick Stats:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
            12 New Users
          </span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
            5 Pending Approvals
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            System: Online
          </span>
        </div>
      )} */}

      {/* {isAuthenticated && user?.role === "Doctor" && (
        <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            Today:
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
            8 Appointments
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            3 Completed
          </span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
            2 Pending
          </span>
        </div>
      )} */}
    </header>
  );
};

export default Navbar;
