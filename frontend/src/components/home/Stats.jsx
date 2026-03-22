import { Stethoscope, Users, Calendar, Building2 } from "lucide-react";

const Stats = ({ counters }) => {
  const statItems = [
    {
      label: "Doctors",
      value: counters.doctors,
      suffix: "+",
      icon: Stethoscope,
      bg: "bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30",
      text: "text-teal-600 dark:text-teal-400",
      accent: "bg-teal-500",
      border:
        "border-teal-200 dark:border-teal-700/50 hover:border-teal-400 dark:hover:border-teal-600",
    },
    {
      label: "Patients",
      value: counters.patients,
      suffix: "+",
      icon: Users,
      bg: "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      accent: "bg-emerald-500",
      border:
        "border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-400 dark:hover:border-emerald-600",
    },
    {
      label: "Appointments",
      value: counters.appointments,
      suffix: "+",
      icon: Calendar,
      bg: "bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      accent: "bg-indigo-500",
      border:
        "border-indigo-200 dark:border-indigo-700/50 hover:border-indigo-400 dark:hover:border-indigo-600",
    },
    {
      label: "Pharmacies",
      value: counters.pharmacies,
      suffix: "+",
      icon: Building2,
      bg: "bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30",
      text: "text-cyan-600 dark:text-cyan-400",
      accent: "bg-cyan-500",
      border:
        "border-cyan-200 dark:border-cyan-700/50 hover:border-cyan-400 dark:hover:border-cyan-600",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {statItems.map((stat, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-2 ${stat.border} transition-all duration-300 hover:shadow-xl hover:shadow-${stat.accent}/20 hover:-translate-y-2 flex flex-col items-center text-center shadow-md`}
            >
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon Container */}
              <div
                className={`relative z-10 p-4 rounded-2xl mb-6 transition-all duration-300 group-hover:scale-125 ${stat.bg}`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl ${stat.accent}/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <stat.icon className={`w-8 h-8 relative z-10 ${stat.text}`} />
              </div>

              {/* Stats Value */}
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight relative z-10">
                {stat.value.toLocaleString()}
                <span className={`text-2xl ml-1 font-bold ${stat.text}`}>
                  {stat.suffix}
                </span>
              </p>

              {/* Label */}
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 relative z-10 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
