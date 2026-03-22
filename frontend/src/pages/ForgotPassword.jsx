import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, handleApiError } from "../services/api";
import {
  Mail,
  Lock,
  Key,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/logo.svg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(formData.email.trim());
      setStep("reset");
      setMessage({
        type: "success",
        text: "OTP sent to your email. Enter it below to reset.",
      });
    } catch (error) {
      const errorInfo = handleApiError(error);
      setMessage({
        type: "error",
        text: errorInfo.message || "Failed to send OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.otp.trim()) {
      setMessage({
        type: "error",
        text: "Please enter the OTP from your email.",
      });
      return;
    }

    if (!isStrongPassword(formData.new_password)) {
      setMessage({
        type: "error",
        text: "Password must be 8+ chars with uppercase, lowercase & number.",
      });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPasswordWithOtp({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        new_password: formData.new_password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Password reset successful. Please sign in." },
      });
    } catch (error) {
      const errorInfo = handleApiError(error);
      setMessage({
        type: "error",
        text: errorInfo.message || "Failed to reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-600">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Security Lock"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/80 to-blue-900/90"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-8 text-white h-full w-full">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mb-4 shadow-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Account <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                Recovery
              </span>
            </h1>
            <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
              Securely reset your password and regain access to your medical
              records and appointments.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-400/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Verify Identity</h3>
                <p className="text-xs text-indigo-100">
                  We'll send a secure OTP to your email
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6">
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
              {step === "request" ? "Forgot Password?" : "Reset Password"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {step === "request"
                ? "Enter your email to receive a recovery code."
                : "Enter the code and create a new password."}
            </p>
          </div>

          {/* Messages */}
          {message.text && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 border-l-4 ${
                message.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                  : "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <p className="text-xs font-medium">{message.text}</p>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all duration-200"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/30 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Recovery Code
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  OTP Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all duration-200"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="new_password"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="Create new password"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm_password"
                  className="text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/30 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep("request");
                    setMessage({ type: "", text: "" });
                  }}
                  className="w-full mt-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Change Email / Resend Code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
