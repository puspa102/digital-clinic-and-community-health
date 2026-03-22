import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Activity,
  Shield,
  Star,
  Users,
} from "lucide-react";
import logo from "../assets/logo.svg";

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phone.replace(/\s/g, ""),
      )
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Public registration is Patient-only (backend enforces this)
    const result = await register({
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
    });

    setLoading(false);

    if (result.success) {
      navigate("/verify-otp", {
        state: {
          email: formData.email.trim().toLowerCase(),
          message: "Registration successful! Please verify your email.",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 overflow-hidden">
      {/* Left Side - Registration Form (Clean White) */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[45%] h-screen">
        <div className="mx-auto w-full max-w-sm lg:max-w-[400px]">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            title="Go to Home"
          >
            <img src={logo} alt="Digital Clinic Logo" className="w-12 h-12" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-700 hover:to-indigo-700 transition-all duration-300 tracking-tight">
              Digital Clinic
            </span>
          </button>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get started with your free patient account today.
            </p>
          </div>

          <div className="mt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3">
                <div className="flex-shrink-0 text-red-500 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="full_name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`block w-full pl-11 pr-4 py-3 text-sm border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                      formErrors.full_name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {formErrors.full_name && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                    {formErrors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`block w-full pl-11 pr-4 py-3 text-sm border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className={`block w-full pl-11 pr-4 py-3 text-sm border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                      formErrors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      className={`block w-full pl-11 pr-10 py-3 text-sm border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                        formErrors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Confirm
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`block w-full pl-11 pr-10 py-3 text-sm border rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                        formErrors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-200 dark:border-gray-700 focus:border-emerald-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign Up
                      <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="hover:underline text-emerald-600">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="hover:underline text-emerald-600">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Frame */}
      <div className="hidden lg:block relative w-0 flex-1 p-6">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Medical Professional"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-transparent to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <div className="max-w-md">
              <div className="flex gap-4 mb-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 border-emerald-900 bg-emerald-${
                        i * 100 + 100
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="flex items-center font-bold">10k+ Patients</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Join our growing community.
              </h3>
              <p className="text-emerald-100/90 text-lg">
                "Access top-tier medical care, manage appointments, and take
                control of your well-being with Digital Clinic."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
