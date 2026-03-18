import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    // Prevent double verification in React.StrictMode
    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verifyPayment = async () => {
      try {
        // 1. Check for eSewa response (data param)
        const dataParam = searchParams.get("data");
        let productId = null;

        if (dataParam) {
          try {
            // eSewa returns base64 encoded JSON
            const decodedData = JSON.parse(atob(dataParam));
            productId =
              decodedData.transaction_uuid || decodedData.transaction_code;
          } catch (err) {
            console.error("Failed to decode eSewa response", err);
            setStatus("failed");
            setMessage("Invalid payment response received.");
            return;
          }
        } else {
          // Khalti or other gateway
          productId = searchParams.get("purchase_order_id");
        }

        const pidx = searchParams.get("pidx"); // Khalti specific

        if (!productId && !pidx) {
          setStatus("failed");
          setMessage("No transaction ID found in verification request.");
          return;
        }

        // 2. Call backend to verify
        const response = await api.post("/payments/confirm", {
          product_id: productId,
          pidx: pidx,
        });

        if (response.data.success) {
          setStatus("success");
          setMessage("Payment confirmed successfully!");
          setPaymentDetails(response.data.data);
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Payment verification failed.");
          setErrorDetails(response.data.data || response.data);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage(
          error.response?.data?.message ||
            "An error occurred while verifying your payment.",
        );
        setErrorDetails(error.response?.data || error.message);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
        {status === "verifying" && (
          <div className="py-8">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we confirm your transaction...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>

            {paymentDetails && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-8 text-left text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Amount Paid:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Rs. {paymentDetails.payment_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Transaction ID:
                  </span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {paymentDetails.payment_reference?.substring(0, 15)}...
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/patient/dashboard"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/patient/appointments"
                className="block w-full py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium transition-colors"
              >
                View Appointments
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="py-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>

            {errorDetails && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-left mb-8 overflow-auto max-h-48 border border-red-100 dark:border-red-800/50">
                <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-2 uppercase tracking-wider">
                  Error Details
                </p>
                <pre className="text-[10px] text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap break-all">
                  {typeof errorDetails === "object"
                    ? JSON.stringify(errorDetails, null, 2)
                    : errorDetails}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/patient/dashboard"
                className="block w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="block w-full py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;
