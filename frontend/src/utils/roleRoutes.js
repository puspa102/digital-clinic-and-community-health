/**
 * Role-based routing utility functions
 * Handles routing logic based on user roles
 */

// Role-based dashboard paths
export const ROLE_DASHBOARD_PATHS = {
  Patient: "/patient/dashboard",
  Doctor: "/doctor/dashboard",
  Admin: "/admin/dashboard",
  Pharmacy: "/pharmacy/dashboard",
};

// Default dashboard path if role is not found
export const DEFAULT_DASHBOARD_PATH = "/patient/dashboard";

/**
 * Get the dashboard path for a specific role
 * @param {string} role - User role (Patient, Doctor, Admin, Pharmacy)
 * @returns {string} - Dashboard path for the role
 */
export const getRoleDashboardPath = (role) => {
  if (!role) return DEFAULT_DASHBOARD_PATH;
  return ROLE_DASHBOARD_PATHS[role] || DEFAULT_DASHBOARD_PATH;
};

/**
 * Get role from path
 * @param {string} path - Current URL path
 * @returns {string} - Role based on path
 */
export const getRoleFromPath = (path) => {
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/doctor")) return "Doctor";
  if (path.startsWith("/pharmacy")) return "Pharmacy";
  if (path.startsWith("/patient")) return "Patient";
  return null;
};

/**
 * Check if user has access to a specific path based on their role
 * @param {string} userRole - User's role
 * @param {string} path - Path to check access for
 * @returns {boolean} - Whether user has access
 */
export const hasAccessToPath = (userRole, path) => {
  const pathRole = getRoleFromPath(path);

  // If no specific role required for path, allow access
  if (!pathRole) return true;

  // Admin has access to everything
  if (userRole === "Admin") return true;

  // Check if user role matches path role
  return userRole === pathRole;
};

/**
 * Get redirect path after login based on user role
 * @param {object} user - User object with role property
 * @param {string} intendedPath - Path user intended to visit (optional)
 * @returns {string} - Path to redirect to
 */
export const getLoginRedirectPath = (user, intendedPath = null) => {
  if (!user || !user.role) {
    return "/login";
  }

  // If there's an intended path and user has access, redirect there
  if (intendedPath && hasAccessToPath(user.role, intendedPath)) {
    return intendedPath;
  }

  // Otherwise, redirect to role-specific dashboard
  return getRoleDashboardPath(user.role);
};

/**
 * Get available navigation items based on user role
 * @param {string} role - User role
 * @returns {Array} - Array of navigation items
 */
export const getNavigationItems = (role) => {
  const commonItems = [
    { label: "Dashboard", path: getRoleDashboardPath(role), icon: "dashboard" },
    { label: "Profile", path: "/profile", icon: "user" },
  ];

  const roleSpecificItems = {
    Patient: [
      { label: "My Appointments", path: "/patient/appointments", icon: "calendar" },
      { label: "Medical Records", path: "/patient/records", icon: "file" },
      { label: "Find Doctors", path: "/patient/doctors", icon: "search" },
      { label: "Prescriptions", path: "/patient/prescriptions", icon: "prescription" },
    ],
    Doctor: [
      { label: "My Appointments", path: "/doctor/appointments", icon: "calendar" },
      { label: "My Patients", path: "/doctor/patients", icon: "users" },
      { label: "Schedule", path: "/doctor/schedule", icon: "clock" },
      { label: "Prescriptions", path: "/doctor/prescriptions", icon: "prescription" },
    ],
    Admin: [
      { label: "Users", path: "/admin/users", icon: "users" },
      { label: "Doctors", path: "/admin/doctors", icon: "doctor" },
      { label: "Appointments", path: "/admin/appointments", icon: "calendar" },
      { label: "Reports", path: "/admin/reports", icon: "chart" },
      { label: "Settings", path: "/admin/settings", icon: "settings" },
    ],
    Pharmacy: [
      { label: "Orders", path: "/pharmacy/orders", icon: "orders" },
      { label: "Inventory", path: "/pharmacy/inventory", icon: "inventory" },
      { label: "Dispense", path: "/pharmacy/dispense", icon: "dispense" },
      { label: "Reports", path: "/pharmacy/reports", icon: "chart" },
    ],
  };

  return [...commonItems, ...(roleSpecificItems[role] || [])];
};

export default {
  ROLE_DASHBOARD_PATHS,
  DEFAULT_DASHBOARD_PATH,
  getRoleDashboardPath,
  getRoleFromPath,
  hasAccessToPath,
  getLoginRedirectPath,
  getNavigationItems,
};
