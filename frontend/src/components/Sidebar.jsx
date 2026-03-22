import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";
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
  HelpCircle,
  LogOut,
  MessageSquare,
} from "lucide-react";
import logo from "../assets/logo.svg";

const Sidebar = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    chatAPI
      .getUnreadCount()
      .then((response) => {
        if (response.success) {
          setUnreadMessages(response.data.unread_count || 0);
        }
      })
      .catch(() => {});

    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.on("message_notification", () => {
      setUnreadMessages((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.role]);

  const isActivePath = (path) => location.pathname === path;

  const navigationConfig = {
    guest: [
      { label: "Home", path: "/", icon: Home },
      { label: "Login", path: "/login", icon: LogIn },
      { label: "Register", path: "/register", icon: UserPlus },
    ],

    Patient: [
      { label: "Dashboard", path: "/patient/dashboard", icon: LayoutDashboard },
      { label: "Book Appointment", path: "/patient/pharmacies", icon: Search },
      {
        label: "My Appointments",
        path: "/patient/appointments",
        icon: Calendar,
      },
      {
        label: "Prescriptions",
        path: "/patient/prescriptions",
        icon: Tablet,
      },
      { label: "Emergency", path: "/emergency", icon: Activity },
    ],

    Doctor: [
      { label: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
      {
        label: "My Appointments",
        path: "/doctor/appointments",
        icon: Calendar,
      },
      { label: "Patients", path: "/doctor/patients", icon: Users },
      { label: "Schedule", path: "/doctor/schedule", icon: Clock },
      {
        label: "Prescriptions",
        path: "/doctor/prescriptions",
        icon: FileCheck,
      },
    ],

    Admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Doctors", path: "/admin/doctors", icon: CheckCircle },
      { label: "Appointments", path: "/admin/appointments", icon: Calendar },
      { label: "Pharmacies", path: "/admin/pharmacies", icon: ShoppingBag },
      { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    ],

    Pharmacy: [
      {
        label: "Dashboard",
        path: "/pharmacy/dashboard",
        icon: LayoutDashboard,
      },
      { label: "Appointments", path: "/pharmacy/appointments", icon: Calendar },
      { label: "Doctors", path: "/pharmacy/doctors", icon: Users },
      { label: "Inventory", path: "/pharmacy/inventory", icon: Package },
      { label: "Orders", path: "/pharmacy/orders", icon: ShoppingBag },
      { label: "Reports", path: "/pharmacy/reports", icon: BarChart3 },
    ],
  };

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return navigationConfig.guest;
    }
    return navigationConfig[user.role] || navigationConfig.guest;
  };

  const navItems = getNavItems();

  const getRoleConfig = () => {
    const configs = {
      Admin: {
        color: "bg-purple-600",
        textColor: "text-purple-600",
        activeColor: "bg-purple-100 dark:bg-purple-900/30",
        activeText: "text-purple-700 dark:text-purple-400",
        indicator: "bg-purple-600",
      },
      Doctor: {
        color: "bg-green-600",
        textColor: "text-green-600",
        activeColor: "bg-green-100 dark:bg-green-900/30",
        activeText: "text-green-700 dark:text-green-400",
        indicator: "bg-green-600",
      },
      Patient: {
        color: "bg-teal-600",
        textColor: "text-teal-600",
        activeColor: "bg-teal-50 dark:bg-teal-900/20",
        activeText: "text-teal-700 dark:text-teal-400",
        indicator: "bg-teal-600",
      },
      Pharmacy: {
        color: "bg-orange-600",
        textColor: "text-orange-600",
        activeColor: "bg-orange-100 dark:bg-orange-900/30",
        activeText: "text-orange-700 dark:text-orange-400",
        indicator: "bg-orange-600",
      },
    };
    return configs[user?.role] || configs.Patient;
  };

  const roleConfig = getRoleConfig();

  const getProfilePath = () => {
    if (!isAuthenticated || !user) return "/login";
    return `/${user.role.toLowerCase()}/profile`;
  };

  const getSettingsPath = () => {
    if (!isAuthenticated || !user) return "/login";
    return `/${user.role.toLowerCase()}/settings`;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMinimized ? "lg:w-16" : "w-60"}`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40">
            <img
              src={logo}
              alt="Digital Clinic logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          {!isMinimized && (
            <div className="overflow-hidden">
              <h1 className="text-[15px] font-bold leading-tight tracking-tight whitespace-nowrap text-gray-900 dark:text-white">
                Digital Clinic
              </h1>
              {isAuthenticated && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${roleConfig.indicator}`}
                  />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${roleConfig.textColor}`}
                  >
                    {user?.role}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        {isAuthenticated && (
          <Link
            to={getProfilePath()}
            onClick={onClose}
            className={`flex items-center gap-3 mx-3 mt-4 mb-1 px-3 py-2.5 rounded-xl cursor-pointer transition-colors bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isMinimized ? "justify-center px-0" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${roleConfig.color} text-white overflow-hidden`}
            >
              {user?.profile_picture ? (
                <img
                  src={`http://localhost:5000/${user.profile_picture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            {!isMinimized && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-tight text-gray-900 dark:text-white">
                  {user?.full_name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </Link>
        )}

        {/* Menu Label */}
        {!isMinimized && (
          <div className="px-5 pt-5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Menu
            </span>
          </div>
        )}
        {isMinimized && <div className="pt-4" />}

        {/* Navigation Items */}
        <nav
          className={`flex-1 px-3 space-y-0.5 ${isMinimized ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={isMinimized ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 group relative ${
                  isMinimized ? "justify-center" : ""
                } ${
                  isActive
                    ? `${roleConfig.activeColor} ${roleConfig.activeText}`
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${roleConfig.indicator}`}
                  />
                )}
                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${isActive ? roleConfig.activeText : ""}`}
                />
                {!isMinimized && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isMinimized && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 bg-gray-900 text-white shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Chat in main menu */}
          {isAuthenticated && (
            <Link
              to="/chat"
              onClick={onClose}
              title={isMinimized ? "Chat" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all group relative ${
                isMinimized ? "justify-center" : ""
              } ${
                isActivePath("/chat")
                  ? `${roleConfig.activeColor} ${roleConfig.activeText}`
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {isActivePath("/chat") && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${roleConfig.indicator}`}
                />
              )}
              <div className="relative shrink-0">
                <MessageSquare
                  size={19}
                  className={`transition-colors ${isActivePath("/chat") ? roleConfig.activeText : ""}`}
                />
                {unreadMessages > 0 && !isActivePath("/chat") && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              {!isMinimized && <span className="whitespace-nowrap">Chat</span>}
              {isMinimized && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 bg-gray-900 text-white shadow-lg">
                  Chat
                </div>
              )}
            </Link>
          )}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />

        {/* Support Label */}
        {!isMinimized && isAuthenticated && (
          <div className="px-5 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Support
            </span>
          </div>
        )}
        {isMinimized && isAuthenticated && <div className="pt-3" />}

        {/* Bottom Items */}
        {isAuthenticated && (
          <div className="px-3 pb-2 space-y-0.5">
            {/* Settings */}
            <Link
              to={getSettingsPath()}
              onClick={onClose}
              title={isMinimized ? "Settings" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all group relative text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white ${
                isMinimized ? "justify-center" : ""
              }`}
            >
              <Settings size={18} className="shrink-0 transition-colors" />
              {!isMinimized && (
                <span className="whitespace-nowrap">Settings</span>
              )}
              {isMinimized && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 bg-gray-900 text-white shadow-lg">
                  Settings
                </div>
              )}
            </Link>

            {/* Help */}
            <button
              title={isMinimized ? "Help & Support" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all group relative text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white ${
                isMinimized ? "justify-center" : ""
              }`}
            >
              <HelpCircle size={18} className="shrink-0 transition-colors" />
              {!isMinimized && (
                <span className="whitespace-nowrap">Help & Support</span>
              )}
              {isMinimized && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 bg-gray-900 text-white shadow-lg">
                  Help & Support
                </div>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title={isMinimized ? "Logout" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all group relative text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                isMinimized ? "justify-center" : ""
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {!isMinimized && (
                <span className="whitespace-nowrap">Logout</span>
              )}
              {isMinimized && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 bg-gray-900 text-white shadow-lg">
                  Logout
                </div>
              )}
            </button>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="hidden lg:block px-3 py-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onToggleMinimize}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white ${
              isMinimized ? "justify-center" : ""
            }`}
          >
            {isMinimized ? (
              <ChevronRight size={16} className="shrink-0" />
            ) : (
              <>
                <ChevronLeft size={16} className="shrink-0" />
                <span className="whitespace-nowrap">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
