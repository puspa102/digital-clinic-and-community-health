import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { XCircle, AlertTriangle } from "lucide-react";

const Failure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Payment could not be processed.");

  useEffect(() => {
    // Check for error messages in query params
    const errorMsg = searchParams.get("message") || searchParams.get("error");
    if (errorMsg) {
      setMessage(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Failed
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          {message}
          <br />
          Please try again or contact support if the issue persists.
        </p>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              Note
            </h3>
            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
              If money was deducted from your account, it will be automatically refunded within 3-5 business days.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>

          <Link
            to="/patient/dashboard"
            className="block w-full py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Failure;
