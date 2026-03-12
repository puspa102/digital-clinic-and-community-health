import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          text: "Email verified successfully! Redirecting to login...",
        });
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message: "Your account has been verified. You can now login.",
            },
          });
        }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Verify Your Email
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                message.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              {message.type === "error" ? (
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              <span
                className={`text-sm ${
                  message.type === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {message.text}
              </span>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
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
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all duration-200
                    ${
                      loading
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }
                    ${digit ? "border-blue-500" : "border-gray-300"}`}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600">
              Didn't receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-400 font-medium">
                  Resend in {countdown}s
                </span>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              Wrong email?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                Go back to registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
