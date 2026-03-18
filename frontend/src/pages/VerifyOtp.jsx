import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, index) => {
        if (index < 6) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setMessage({
        type: "error",
        text: "Please enter the complete 6-digit OTP",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(email, otpString);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Verified! Redirecting...",
        });
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message: "Your account has been verified. You can now login.",
            },
          });
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      const result = await resendOtp(email);

      if (result.success) {
        setMessage({
          type: "success",
          text: "OTP has been resent to your email.",
        });
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to resend OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cyan-600">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Digital Verification"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-cyan-800/80 to-blue-900/90"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-8 text-white h-full w-full">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mb-4 shadow-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Verify Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                Identity
              </span>
            </h1>
            <p className="text-lg text-cyan-100 max-w-md leading-relaxed">
              We need to verify your email address to ensure your account
              security and activate your profile.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Check your inbox</h3>
                <p className="text-xs text-cyan-100">
                  We've sent a 6-digit code to {email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enter Verification Code
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Please enter the code we sent to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
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

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  autoComplete="one-time-code"
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200
                    ${
                      loading
                        ? "bg-gray-50 cursor-not-allowed text-gray-400 border-gray-200"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900"
                    }
                    ${
                      digit
                        ? "border-cyan-500 dark:border-cyan-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-cyan-500/30 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Email
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="space-y-4">
            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?{" "}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Resend Code
                  </button>
                ) : (
                  <span className="font-medium text-gray-400">
                    Resend in {countdown}s
                  </span>
                )}
              </p>
            </div>

            {/* Back link */}
            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft size={16} />
                Wrong email? Go back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
