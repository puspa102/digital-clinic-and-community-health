import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Home,
  LogIn,
  UserPlus,
  Calendar,
  FileText,
  Search,
  Users,
  User,
  Clock,
  BarChart3,
  Settings,
  ShoppingBag,
  Package,
  Tablet,
  FileCheck,
  CheckCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  const icons = {
    dashboard: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    home: <Home className="w-5 h-5 shrink-0" />,
    login: <LogIn className="w-5 h-5 shrink-0" />,
    register: <UserPlus className="w-5 h-5 shrink-0" />,
    calendar: <Calendar className="w-5 h-5 shrink-0" />,
    file: <FileText className="w-5 h-5 shrink-0" />,
    search: <Search className="w-5 h-5 shrink-0" />,
    users: <Users className="w-5 h-5 shrink-0" />,
    user: <User className="w-5 h-5 shrink-0" />,
    clock: <Clock className="w-5 h-5 shrink-0" />,
    chart: <BarChart3 className="w-5 h-5 shrink-0" />,
    settings: <Settings className="w-5 h-5 shrink-0" />,
    orders: <ShoppingBag className="w-5 h-5 shrink-0" />,
    inventory: <Package className="w-5 h-5 shrink-0" />,
    dispense: <Tablet className="w-5 h-5 shrink-0" />,
    prescription: <FileCheck className="w-5 h-5 shrink-0" />,
    verify: <CheckCircle className="w-5 h-5 shrink-0" />,
    emergency: <Activity className="w-5 h-5 shrink-0" />,
    chevronLeft: <ChevronLeft className="w-4 h-4 shrink-0" />,
    chevronRight: <ChevronRight className="w-4 h-4 shrink-0" />,
  };

  const navigationConfig = {
    guest: [
      { label: "Home", path: "/", icon: icons.home },
      { label: "Login", path: "/login", icon: icons.login },
      { label: "Register", path: "/register", icon: icons.register },
    ],

    Patient: [
      { label: "Dashboard", path: "/patient/dashboard", icon: icons.dashboard },
      { label: "Find Pharmacies", path: "/patient/pharmacies", icon: icons.search },
      { label: "My Appointments", path: "/patient/appointments", icon: icons.calendar },
      { label: "Emergency", path: "/emergency", icon: icons.emergency },
      { label: "Medical History", path: "/patient/history", icon: icons.file },
      { label: "Profile", path: "/patient/profile", icon: icons.user },
      { label: "Settings", path: "/patient/settings", icon: icons.settings },
    ],

    Doctor: [
      { label: "Dashboard", path: "/doctor/dashboard", icon: icons.dashboard },
      { label: "My Appointments", path: "/doctor/appointments", icon: icons.calendar },
      { label: "Patients", path: "/doctor/patients", icon: icons.users },
      { label: "Schedule", path: "/doctor/schedule", icon: icons.clock },
      { label: "Prescriptions", path: "/doctor/prescriptions", icon: icons.prescription },
      { label: "Profile", path: "/doctor/profile", icon: icons.user },
      { label: "Settings", path: "/doctor/settings", icon: icons.settings },
    ],

    Admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: icons.dashboard },
      { label: "Users", path: "/admin/users", icon: icons.users },
      { label: "Doctors", path: "/admin/doctors", icon: icons.verify },
      { label: "Appointments", path: "/admin/appointments", icon: icons.calendar },
      { label: "Pharmacies", path: "/admin/pharmacies", icon: icons.orders },
      { label: "Reports", path: "/admin/reports", icon: icons.chart },
      { label: "Settings", path: "/admin/settings", icon: icons.settings },
    ],

    Pharmacy: [
      { label: "Dashboard", path: "/pharmacy/dashboard", icon: icons.dashboard },
      { label: "Appointments", path: "/pharmacy/appointments", icon: icons.calendar },
      { label: "Doctors", path: "/pharmacy/doctors", icon: icons.users },
      { label: "Inventory", path: "/pharmacy/inventory", icon: icons.inventory },
      { label: "Orders", path: "/pharmacy/orders", icon: icons.orders },
      { label: "Reports", path: "/pharmacy/reports", icon: icons.chart },
      { label: "Settings", path: "/pharmacy/settings", icon: icons.settings },
    ],
  };

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return navigationConfig.guest;
    }
    return navigationConfig[user.role] || navigationConfig.guest;
  };

  const navItems = getNavItems();

  const getRoleColor = () => {
    const colors = {
      Admin: {
        primary: "bg-purple-600",
        light: "bg-purple-100",
        text: "text-purple-600",
        hover: "hover:bg-purple-50",
        active: "bg-purple-100 text-purple-700",
      },
      Doctor: {
        primary: "bg-green-600",
        light: "bg-green-100",
        text: "text-green-600",
        hover: "hover:bg-green-50",
        active: "bg-green-100 text-green-700",
      },
      Patient: {
        primary: "bg-blue-600",
        light: "bg-blue-100",
        text: "text-blue-600",
        hover: "hover:bg-blue-50",
        active: "bg-blue-100 text-blue-700",
      },
      Pharmacy: {
        primary: "bg-orange-600",
        light: "bg-orange-100",
        text: "text-orange-600",
        hover: "hover:bg-orange-50",
        active: "bg-orange-100 text-orange-700",
      },
    };
    return colors[user?.role] || colors.Patient;
  };

  const roleColors = getRoleColor();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMinimized ? "lg:w-20" : "w-64"}`}
      >
        {/* Logo */}
        <div
          className={`flex items-center ${
            isMinimized ? "justify-center" : "gap-3"
          } p-4 border-b relative`}
        >
          <div
            className={`w-10 h-10 ${roleColors.primary} rounded-lg flex items-center justify-center`}
          >
            <Activity className="w-6 h-6 text-white" />
          </div>

          {!isMinimized && (
            <div className="flex-1">
              <h1 className="font-bold text-gray-900">Digital Clinic</h1>
              {isAuthenticated ? (
                <span className={`text-xs ${roleColors.text} font-medium`}>
                  {user?.role} Portal
                </span>
              ) : (
                <span className="text-xs text-gray-500">Welcome</span>
              )}
            </div>
          )}

          <button
            onClick={onToggleMinimize}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50"
          >
            {isMinimized ? icons.chevronRight : icons.chevronLeft}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center ${
                isMinimized ? "justify-center" : "gap-3"
              } px-4 py-3 rounded-lg transition-all ${
                isActivePath(item.path)
                  ? roleColors.active
                  : `text-gray-600 ${roleColors.hover}`
              }`}
              title={isMinimized ? item.label : undefined}
            >
              {item.icon}
              {!isMinimized && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {/* {isAuthenticated ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            {!isMinimized && (
              <p className="text-center text-xs text-gray-400">
                {user?.role} Portal
              </p>
            )}
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <div className="space-y-2">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {icons.login}
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {icons.register}
                <span>Register</span>
              </Link>
            </div>
          </div>
        )} */}
      </aside>
    </>
  );
};

export default Sidebar;