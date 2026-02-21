import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    // Load minimized state from localStorage
    const saved = localStorage.getItem("sidebarMinimized");
    return saved === "true";
  });
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Persist minimized state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarMinimized", sidebarMinimized.toString());
  }, [sidebarMinimized]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const toggleSidebarMinimized = () => {
    setSidebarMinimized((prev) => !prev);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isMinimized={sidebarMinimized}
        onToggleMinimize={toggleSidebarMinimized}
      />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${
          sidebarMinimized ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Navbar Component */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;