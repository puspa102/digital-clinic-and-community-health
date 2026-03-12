import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  showBackButton = true
}) => {
  const { user, isAuthenticated } = useAuth();

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!isAuthenticated || !user?.role) {
      return "/";
    }
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h1>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-8">{description}</p>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>In Development</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
            <div
              className="bg-blue-500 h-2 rounded-full animate-pulse"
              style={{ width: "45%" }}
            ></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {showBackButton && (
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          )}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-10 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Want to be notified?
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Check back soon or contact support for updates on this feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
