import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import logo from "../assets/logo.svg";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogoClick = () => {
    navigate("/");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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

    setIsSubmitting(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Check if user has temporary password
      if (result.data?.user?.is_temp_password) {
        // Redirect to reset password page
        navigate("/reset-password", {
          replace: true,
          state: { role: result.data.user.role },
        });
      } else {
        // Normal login flow
        navigate(from, { replace: true });
      }
    } else if (result.code === "EMAIL_NOT_VERIFIED" && result.email) {
      // Redirect to OTP verification page
      navigate("/verify-otp", {
        replace: true,
        state: { email: result.email },
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Side - Login Form (Clean White) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full md:w-1/2 lg:w-[45%]">
        <div className="mx-auto w-full max-w-sm lg:max-w-[400px]">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            title="Go to Home"
          >
            <img src={logo} alt="Digital Clinic Logo" className="w-12 h-12" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Digital Clinic
            </span>
          </button>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="mt-8">
            {/* Messages */}
            {location.state?.message && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  {location.state.message}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3">
                <div className="flex-shrink-0 text-red-500 dark:text-red-400">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`block w-full pl-11 pr-4 py-4 text-sm border rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`block w-full pl-11 pr-12 py-4 text-sm border rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 ${
                      formErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                        : "border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {isSubmitting ? (
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
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                New to Digital Clinic?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Digital Clinic. Secure &
              Private.
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image Frame */}
      <div className="hidden lg:block relative w-0 flex-1 p-6">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1675270548942-b03f0672e708?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTN8fGZlbWFsZSUyMGRvY3RvcnxlbnwwfHwwfHx8Mg%3D%3D"
            alt="Professional Female Doctor"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
            <div className="max-w-md">
              <div className="flex gap-4 mb-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 border-blue-900 bg-blue-${
                        i * 100 + 100
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="flex items-center font-bold">10k+ Patients</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Top-tier healthcare management.
              </h3>
              <p className="text-blue-100/90 text-lg">
                "This platform has revolutionized how we handle patient data.
                Secure, fast, and intuitive."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
