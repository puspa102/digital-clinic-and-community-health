import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import logo from "../../assets/logo.svg";

const HomeNavbar = ({ isDark, toggleTheme, isAuthenticated }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Reviews", href: "#reviews" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Digital Clinic"
              className="w-12 h-12 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300 bg-white rounded-xl p-1"
            />
            <div>
              <h1
                className={`text-lg font-bold transition-colors ${
                  scrolled ? "text-gray-900 dark:text-white" : "text-white"
                }`}
              >
                Digital Clinic
              </h1>
              <p
                className={`text-[10px] font-medium tracking-wider uppercase transition-colors ${
                  scrolled
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-teal-200"
                }`}
              >
                Community Health
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-teal-400 ${
                  scrolled
                    ? "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                    : "text-gray-200 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    scrolled
                      ? "text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400"
                      : "text-white hover:text-teal-200"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-white bg-white/10"
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? "text-gray-900 dark:text-white" : "text-white"
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-xl md:hidden transition-all duration-300 ease-in-out origin-top ${
          mobileMenuOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 h-0 overflow-hidden"
        }`}
      >
        <div className="p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-2"
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full py-3 text-center text-sm font-semibold bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-teal-500/30"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full py-3 text-center text-sm font-medium text-teal-600 dark:text-teal-400 border-2 border-teal-200 dark:border-teal-700/50 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-3 text-center text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-xl hover:from-teal-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-teal-500/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
