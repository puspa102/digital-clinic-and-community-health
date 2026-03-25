import { Link } from "react-router-dom";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";

const PendingPayments = ({ pendingPayments, handlePay, payingId }) => {
  if (pendingPayments.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 text-center shadow-lg">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-lg">
          All Paid Up!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-semibold">
          No pending payments
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
          Pending Payments
        </h3>
        {pendingPayments.slice(0, 2).map((apt) => (
          <div
            key={apt.appointment_id}
            className="mb-6 last:mb-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50"
          >
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Rs. {apt.payment_amount}
              </p>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                Due for Dr. {apt.Doctor?.User?.full_name || "Doctor"}
              </p>
            </div>

            {/* Payment Gateway Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-3">
                Pay via Secure Gateway
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePay(apt, "esewa")}
                  disabled={payingId === `${apt.appointment_id}-esewa`}
                  className="group relative overflow-hidden flex flex-col items-center gap-1 px-3 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:scale-110 transition-transform duration-500 rounded-full blur-xl"></div>
                  {payingId === `${apt.appointment_id}-esewa` ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <span className="text-sm font-black tracking-wide relative z-10">
                      eSewa
                    </span>
                  )}
                  <span className="text-[10px] font-semibold opacity-90 relative z-10">
                    Pay with eSewa
                  </span>
                </button>
                <button
                  onClick={() => handlePay(apt, "khalti")}
                  disabled={payingId === `${apt.appointment_id}-khalti`}
                  className="group relative overflow-hidden flex flex-col items-center gap-1 px-3 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:scale-110 transition-transform duration-500 rounded-full blur-xl"></div>
                  {payingId === `${apt.appointment_id}-khalti` ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <span className="text-sm font-black tracking-wide relative z-10">
                      Khalti
                    </span>
                  )}
                  <span className="text-[10px] font-semibold opacity-90 relative z-10">
                    Pay with Khalti
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingPayments.length > 2 && (
          <Link
            to="/patient/appointments"
            className="block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors mt-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg"
          >
            +{pendingPayments.length - 2} more pending
          </Link>
        )}
      </div>
    </div>
  );
};

export default PendingPayments;
