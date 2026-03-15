import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api, { handleApiError, formatDate, formatTime, APPOINTMENT_STATUS } from "../services/api";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  X,
  Pill,
  Stethoscope,
  Building2,
  Users,
  Package,
  ChevronDown,
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setSearchLoading(true);
    setShowSearch(true);
    const results = [];

    try {
      const searchLower = query.toLowerCase();

      if (user?.role === "Patient") {
        // Search doctors
        const doctorsRes = await api.get("/doctors").catch(() => null);
        if (doctorsRes?.data?.data) {
          doctorsRes.data.data
            .filter((d) => 
              d.User?.name?.toLowerCase().includes(searchLower) ||
              d.specialization?.toLowerCase().includes(searchLower)
            )
            .slice(0, 5)
            .forEach((doc) => {
              results.push({
                id: `doc-${doc.doctor_id}`,
                type: "doctor",
                title: doc.User?.name || "Doctor",
                subtitle: doc.specialization,
                icon: Stethoscope,
                color: "green",
                link: `/patient/doctors?search=${encodeURIComponent(doc.User?.name || "")}`,
              });
            });
        }

        // Search pharmacies
        const pharmaciesRes = await api.get("/pharmacies").catch(() => null);
        if (pharmaciesRes?.data?.data) {
          pharmaciesRes.data.data
            .filter((p) => 
              p.name?.toLowerCase().includes(searchLower) ||
              p.address?.toLowerCase().includes(searchLower)
            )
            .slice(0, 5)
            .forEach((pharm) => {
              results.push({
                id: `pharm-${pharm.pharmacy_id}`,
                type: "pharmacy",
                title: pharm.name,
                subtitle: pharm.address,
                icon: Building2,
                color: "teal",
                link: "/patient/pharmacies",
              });
            });
        }
      } else if (user?.role === "Doctor") {
        // Search patients (from appointments)
        const appointmentsRes = await api.get("/appointments/doctor/me").catch(() => null);
        if (appointmentsRes?.data?.data) {
          const uniquePatients = new Map();
          appointmentsRes.data.data.forEach((apt) => {
            if (apt.User && !uniquePatients.has(apt.User.user_id)) {
              if (apt.User.name?.toLowerCase().includes(searchLower) ||
                  apt.User.email?.toLowerCase().includes(searchLower)) {
                uniquePatients.set(apt.User.user_id, apt.User);
              }
            }
          });
          Array.from(uniquePatients.values()).slice(0, 5).forEach((patient) => {
            results.push({
              id: `patient-${patient.user_id}`,
              type: "patient",
              title: patient.name,
              subtitle: patient.email,
              icon: Users,
              color: "blue",
              link: "/doctor/patients",
            });
          });
        }
      } else if (user?.role === "Pharmacy") {
        // Search inventory
        const inventoryRes = await api.get("/inventory").catch(() => null);
        if (inventoryRes?.data?.data) {
          inventoryRes.data.data
            .filter((item) => 
              item.medicine_name?.toLowerCase().includes(searchLower) ||
              item.category?.toLowerCase().includes(searchLower)
            )
            .slice(0, 5)
            .forEach((item) => {
              results.push({
                id: `inv-${item.inventory_id}`,
                type: "inventory",
                title: item.medicine_name,
                subtitle: `${item.quantity} ${item.unit} - रु ${item.price}`,
                icon: Package,
                color: "orange",
                link: "/pharmacy/inventory",
              });
            });
        }

        // Search doctors
        const doctorsRes = await api.get("/doctors").catch(() => null);
        if (doctorsRes?.data?.data) {
          doctorsRes.data.data
            .filter((d) => 
              d.User?.name?.toLowerCase().includes(searchLower) ||
              d.specialization?.toLowerCase().includes(searchLower)
            )
            .slice(0, 3)
            .forEach((doc) => {
              results.push({
                id: `doc-${doc.doctor_id}`,
                type: "doctor",
                title: doc.User?.name || "Doctor",
                subtitle: doc.specialization,
                icon: Stethoscope,
                color: "green",
                link: "/pharmacy/doctors",
              });
            });
        }
      } else if (user?.role === "Admin") {
        // Search users
        const usersRes = await api.get("/auth/users").catch(() => null);
        if (usersRes?.data?.data) {
          usersRes.data.data
            .filter((u) => 
              u.name?.toLowerCase().includes(searchLower) ||
              u.email?.toLowerCase().includes(searchLower) ||
              u.role?.toLowerCase().includes(searchLower)
            )
            .slice(0, 5)
            .forEach((usr) => {
              results.push({
                id: `user-${usr.user_id}`,
                type: "user",
                title: usr.name,
                subtitle: `${usr.role} - ${usr.email}`,
                icon: Users,
                color: "purple",
                link: "/admin/users",
              });
            });
        }

        // Search doctors
        const doctorsRes = await api.get("/doctors").catch(() => null);
        if (doctorsRes?.data?.data) {
          doctorsRes.data.data
            .filter((d) => 
              d.User?.name?.toLowerCase().includes(searchLower) ||
              d.specialization?.toLowerCase().includes(searchLower)
            )
            .slice(0, 3)
            .forEach((doc) => {
              results.push({
                id: `doc-${doc.doctor_id}`,
                type: "doctor",
                title: doc.User?.name || "Doctor",
                subtitle: doc.specialization,
                icon: Stethoscope,
                color: "green",
                link: "/admin/doctors",
              });
            });
        }

        // Search pharmacies
        const pharmaciesRes = await api.get("/pharmacies").catch(() => null);
        if (pharmaciesRes?.data?.data) {
          pharmaciesRes.data.data
            .filter((p) => 
              p.name?.toLowerCase().includes(searchLower) ||
              p.address?.toLowerCase().includes(searchLower)
            )
            .slice(0, 3)
            .forEach((pharm) => {
              results.push({
                id: `pharm-${pharm.pharmacy_id}`,
                type: "pharmacy",
                title: pharm.name,
                subtitle: pharm.address,
                icon: Building2,
                color: "teal",
                link: "/admin/pharmacies",
              });
            });
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handle search result click
  const handleResultClick = (link) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(link);
  };

  // Get color classes for search results
  const getResultColor = (color) => {
    const colors = {
      green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[color] || colors.blue;
  };

  // Fetch notifications based on user role
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      // Refresh notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const notifs = [];
      const now = new Date();

      if (user?.role === "Patient") {
        // Fetch patient's appointments
        const res = await api.get("/appointments/my-appointments", { params: { limit: 20 } });
        const appointments = res.data?.data || [];
        
        // Upcoming confirmed appointments (next 7 days)
        appointments
          .filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED)
          .forEach((apt) => {
            const aptDate = new Date(apt.appointment_date);
            const diffDays = Math.ceil((aptDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) {
              notifs.push({
                id: `apt-${apt.appointment_id}`,
                type: "appointment",
                title: "Upcoming Appointment",
                message: `${diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`} at ${formatTime(apt.appointment_time)}`,
                time: apt.appointment_date,
                icon: Calendar,
                color: "blue",
                link: "/patient/appointments",
              });
            }
          });

        // Prescription notifications
        const prescRes = await api.get("/prescriptions/patient/me", { params: { limit: 5 } }).catch(() => null);
        if (prescRes?.data?.data?.length > 0) {
          const recentPresc = prescRes.data.data[0];
          const prescDate = new Date(recentPresc.created_at);
          const diffDays = Math.ceil((now - prescDate) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) {
            notifs.push({
              id: `presc-${recentPresc.prescription_id}`,
              type: "prescription",
              title: "New Prescription",
              message: `Dr. ${recentPresc.Doctor?.User?.full_name || "Doctor"} prescribed new medication`,
              time: recentPresc.created_at,
              icon: Pill,
              color: "green",
              link: "/patient/prescriptions",
            });
          }
        }
      } else if (user?.role === "Doctor") {
        // Fetch doctor's appointments
        const res = await api.get("/appointments/my-doctor-appointments", { params: { limit: 20 } });
        const appointments = res.data?.data || [];

        // Pending appointments to confirm
        const assigned = appointments.filter((a) => a.status === APPOINTMENT_STATUS.ASSIGNED);
        if (assigned.length > 0) {
          notifs.push({
            id: "assigned-appointments",
            type: "action",
            title: "Pending Confirmations",
            message: `${assigned.length} appointment${assigned.length > 1 ? "s" : ""} awaiting your confirmation`,
            time: assigned[0]?.created_at,
            icon: Clock,
            color: "yellow",
            link: "/doctor/appointments",
          });
        }

        // Today's appointments
        const todayApts = appointments.filter((a) => {
          const aptDate = new Date(a.appointment_date).toDateString();
          return aptDate === now.toDateString() && a.status === APPOINTMENT_STATUS.CONFIRMED;
        });
        if (todayApts.length > 0) {
          notifs.push({
            id: "today-appointments",
            type: "reminder",
            title: "Today's Schedule",
            message: `You have ${todayApts.length} appointment${todayApts.length > 1 ? "s" : ""} today`,
            time: now.toISOString(),
            icon: Calendar,
            color: "blue",
            link: "/doctor/appointments",
          });
        }
      } else if (user?.role === "Pharmacy") {
        // Fetch pharmacy appointments
        const res = await api.get("/pharmacies/my-appointments", { params: { limit: 20 } });
        const appointments = res.data?.data || [];

        // Requested appointments needing doctor assignment
        const requested = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REQUESTED);
        if (requested.length > 0) {
          notifs.push({
            id: "requested-appointments",
            type: "action",
            title: "Doctor Assignment Needed",
            message: `${requested.length} appointment${requested.length > 1 ? "s" : ""} need doctor assignment`,
            time: requested[0]?.created_at,
            icon: AlertCircle,
            color: "orange",
            link: "/pharmacy/appointments",
          });
        }

        // Today's appointments
        const todayApts = appointments.filter((a) => {
          const aptDate = new Date(a.appointment_date).toDateString();
          return aptDate === now.toDateString();
        });
        if (todayApts.length > 0) {
          notifs.push({
            id: "pharmacy-today",
            type: "info",
            title: "Today's Appointments",
            message: `${todayApts.length} appointment${todayApts.length > 1 ? "s" : ""} scheduled for today`,
            time: now.toISOString(),
            icon: Calendar,
            color: "blue",
            link: "/pharmacy/appointments",
          });
        }
      } else if (user?.role === "Admin") {
        // Fetch pending users
        const usersRes = await api.get("/auth/users", { params: { status: "pending", limit: 10 } });
        const pendingUsers = usersRes.data?.data || [];
        
        if (pendingUsers.length > 0) {
          notifs.push({
            id: "pending-users",
            type: "action",
            title: "Pending Approvals",
            message: `${pendingUsers.length} user${pendingUsers.length > 1 ? "s" : ""} awaiting approval`,
            time: pendingUsers[0]?.created_at,
            icon: UserCheck,
            color: "orange",
            link: "/admin/users?status=pending",
          });
        }

        // System stats
        notifs.push({
          id: "system-status",
          type: "info",
          title: "System Status",
          message: "All systems operational",
          time: now.toISOString(),
          icon: CheckCircle,
          color: "green",
          link: "/admin/reports",
        });
      }

      setNotifications(notifs);
      // Only update unseen count if dropdown is closed
      if (!showNotifications) {
        setUnseenCount(notifs.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark notifications as seen when dropdown opens
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Opening dropdown - mark as seen
      setUnseenCount(0);
    }
  };

  const getNotificationColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[color] || colors.blue;
  };

  const clearNotification = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get role-specific colors
  const getRoleConfig = () => {
    const configs = {
      Admin: {
        bg: "bg-purple-600",
        text: "text-purple-600",
        ring: "ring-purple-500/20",
        badge: "bg-purple-500",
      },
      Doctor: {
        bg: "bg-green-600",
        text: "text-green-600",
        ring: "ring-green-500/20",
        badge: "bg-green-500",
      },
      Patient: {
        bg: "bg-blue-600",
        text: "text-blue-600",
        ring: "ring-blue-500/20",
        badge: "bg-blue-500",
      },
      Pharmacy: {
        bg: "bg-orange-600",
        text: "text-orange-600",
        ring: "ring-orange-500/20",
        badge: "bg-orange-500",
      },
    };
    return configs[user?.role] || configs.Patient;
  };

  const roleConfig = getRoleConfig();

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={22} className="text-gray-600 dark:text-gray-300" />
          </button>

          {/* Page title - Mobile */}
          <h1 className="text-[15px] font-bold text-gray-900 dark:text-white lg:hidden">
            Digital Clinic
          </h1>
        </div>

        {/* Search bar - Desktop only */}
        {isAuthenticated && (
          <div className="hidden lg:flex flex-1 max-w-lg mx-8" ref={searchRef}>
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                placeholder="Search doctors, patients, appointments..."
                className="w-full h-10 pl-10 pr-4 text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

              {/* Search Results Dropdown */}
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-3">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => {
                        const Icon = result.icon;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.link)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                          >
                            <div className={`p-2 rounded-lg ${getResultColor(result.color)}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">
                                {result.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md capitalize font-medium">
                              {result.type}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={18} className="text-gray-400" />
                      </div>
                      <p className="text-[13px] font-medium text-gray-600 dark:text-gray-300">No results found</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun size={20} className="text-amber-500" />
                ) : (
                  <Moon size={20} className="text-gray-500" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={handleNotificationClick}
                  className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                  {unseenCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1 ring-2 ring-white dark:ring-gray-900">
                      {unseenCount > 9 ? "9+" : unseenCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={20} className="text-gray-400" />
                          </div>
                          <p className="text-[13px] font-medium text-gray-600 dark:text-gray-300">No notifications</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {notifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                              <Link
                                key={notif.id}
                                to={notif.link}
                                onClick={() => setShowNotifications(false)}
                                className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                              >
                                <div className={`p-2 rounded-lg shrink-0 ${getNotificationColorClasses(notif.color)}`}>
                                  <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                                    {notif.title}
                                  </p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => clearNotification(notif.id, e)}
                                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={12} className="text-gray-400" />
                                </button>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                        <button
                          onClick={() => fetchNotifications()}
                          className="w-full text-center text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

              {/* Profile Dropdown - Desktop */}
              <div className="hidden lg:flex items-center gap-2.5 ml-1 relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`w-8 h-8 ${roleConfig.bg} rounded-lg flex items-center justify-center text-white text-[12px] font-bold ring-2 ${roleConfig.ring}`}>
                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {user?.full_name?.split(' ')[0]}
                    </p>
                    <p className={`text-[10px] font-medium ${roleConfig.text}`}>
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Profile header */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        to={`/${user?.role?.toLowerCase()}/profile`}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        to={`/${user?.role?.toLowerCase()}/settings`}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                    </div>
                    <hr className="border-gray-100 dark:border-gray-700" />
                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Profile Avatar */}
              <div className="lg:hidden">
                <div
                  className={`w-9 h-9 ${roleConfig.bg} rounded-xl flex items-center justify-center text-white text-[12px] font-bold`}
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
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun size={20} className="text-amber-500" />
                ) : (
                  <Moon size={20} className="text-gray-500" />
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>

              {/* Mobile - just show login button */}
              <Link
                to="/login"
                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-medium shadow-sm"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

    </header>
  );
};

export default Navbar;
