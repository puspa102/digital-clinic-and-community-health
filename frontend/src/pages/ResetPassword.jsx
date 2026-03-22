import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  KeyRound,
  Shield,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/logo.svg";
import api, { handleApiError } from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  // Get user role from location state or default to patient
  const userRole = location.state?.role || "Patient";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength for new password
    if (name === "new_password") {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
      });
    }
  };

  const isPasswordStrong = () => {
    return (
      passwordStrength.hasMinLength &&
      passwordStrength.hasUpperCase &&
      passwordStrength.hasLowerCase &&
      passwordStrength.hasNumber
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.current_password) {
      setError("Please enter your current temporary password");
      return;
    }

    if (!formData.new_password) {
      setError("Please enter a new password");
      return;
    }

    if (!isPasswordStrong()) {
      setError("Password does not meet all requirements");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New password and confirmation do not match");
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError("New password must be different from temporary password");
      return;
    }

    setLoading(true);

    try {
      await api.put("/auth/change-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      // Redirect to dashboard based on role
      const dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
      navigate(dashboardPath, {
        replace: true,
        state: {
          message: "Password reset successful! Welcome to Digital Clinic.",
        },
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(
        errorInfo.message || "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="w-3 h-3 text-green-600" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-gray-300"></div>
      )}
      <span
        className={`${met ? "text-green-700 font-medium" : "text-gray-500"}`}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-purple-600">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Secure Technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-indigo-900/90"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-8 text-white h-full w-full">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mb-4 shadow-lg">
              <KeyRound size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Secure Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                Account
              </span>
            </h1>
            <p className="text-lg text-purple-100 max-w-md leading-relaxed">
              Please update your temporary password to ensure your account
              security and access your personal dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Mandatory Update</h3>
                <p className="text-xs text-purple-100">
                  Required for first-time login
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            title="Go to Home"
          >
            <img src={logo} alt="Digital Clinic Logo" className="w-10 h-10" />
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Digital Clinic
            </span>
          </button>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Set New Password
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a strong password for your new account.
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">Security Notice</p>
              <p className="mt-1 opacity-90">
                You're using a temporary password. For your security, you must
                change it before continuing.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="current_password"
                className="text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Temporary Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="Enter temporary password"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new_password"
                className="text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="Create new password"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Repeat new password"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password must contain:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <PasswordRequirement
                  met={passwordStrength.hasMinLength}
                  text="8+ chars"
                />
                <PasswordRequirement
                  met={passwordStrength.hasUpperCase}
                  text="Uppercase"
                />
                <PasswordRequirement
                  met={passwordStrength.hasLowerCase}
                  text="Lowercase"
                />
                <PasswordRequirement
                  met={passwordStrength.hasNumber}
                  text="Number"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordStrong()}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-purple-500/30 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset & Continue
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@digitalclinic.com"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
