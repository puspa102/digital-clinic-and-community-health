import { Link } from "react-router-dom";

const QuickActions = ({ actions }) => {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.href}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 group ${
                action.accent
                  ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 ${
                  action.accent
                    ? "bg-white dark:bg-gray-800 shadow-sm text-red-500 group-hover:bg-red-500 group-hover:text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-sm font-semibold ${action.accent ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
