/**
 * Role-based routing & navigation utilities
 */

/* ===============================
   DASHBOARD PATHS
================================ */
export const ROLE_DASHBOARD_PATHS = {
  Admin: "/admin/dashboard",
  Doctor: "/doctor/dashboard",
  Patient: "/patient/dashboard",
  Pharmacy: "/pharmacy/dashboard",
};

export const DEFAULT_DASHBOARD_PATH = "/login";

/* ===============================
   DASHBOARD PATH BY ROLE
================================ */
export const getRoleDashboardPath = (role) => {
  return ROLE_DASHBOARD_PATHS[role] || DEFAULT_DASHBOARD_PATH;
};

/* ===============================
   ROLE FROM URL PATH
================================ */
export const getRoleFromPath = (path = "") => {
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/doctor")) return "Doctor";
  if (path.startsWith("/pharmacy")) return "Pharmacy";
  if (path.startsWith("/patient")) return "Patient";
  return null;
};

/* ===============================
   ACCESS CONTROL
================================ */
export const hasAccessToPath = (userRole, path) => {
  const pathRole = getRoleFromPath(path);

  if (!pathRole) return true;
  if (userRole === "Admin") return true;

  return userRole === pathRole;
};

/* ===============================
   LOGIN REDIRECT
================================ */
export const getLoginRedirectPath = (user, intendedPath = null) => {
  if (!user?.role) return "/login";

  if (intendedPath && hasAccessToPath(user.role, intendedPath)) {
    return intendedPath;
  }

  return getRoleDashboardPath(user.role);
};

/* ===============================
   SIDEBAR / NAV ITEMS
================================ */
export const NAVIGATION_CONFIG = {
  Admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Users", path: "/admin/users" },
    { label: "Emergencies", path: "/admin/emergencies" },
    { label: "Reports", path: "/admin/reports" },
    { label: "Settings", path: "/admin/settings" },
  ],
  Doctor: [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Active Emergencies", path: "/doctor/emergencies" },
    { label: "History", path: "/doctor/history" },
  ],
  Patient: [
    { label: "Dashboard", path: "/patient/dashboard" },
    { label: "Create Emergency", path: "/patient/create-emergency" },
    { label: "My Emergencies", path: "/patient/emergencies" },
  ],
  Pharmacy: [
    { label: "Dashboard", path: "/pharmacy/dashboard" },
    { label: "Requests", path: "/pharmacy/requests" },
    { label: "Inventory", path: "/pharmacy/inventory" },
  ],
};

/* ===============================
   GET NAV ITEMS BY ROLE
================================ */
export const getNavigationItems = (role) => {
  return NAVIGATION_CONFIG[role] || [];
};
