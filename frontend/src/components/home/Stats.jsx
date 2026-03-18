import { Stethoscope, Users, Calendar, Building2 } from "lucide-react";

const Stats = ({ counters }) => {
  const statItems = [
    {
      label: "Doctors",
      value: counters.doctors,
      suffix: "+",
      icon: Stethoscope,
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Patients",
      value: counters.patients,
      suffix: "+",
      icon: Users,
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
    },
    {
      label: "Appointments",
      value: counters.appointments,
      suffix: "+",
      icon: Calendar,
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Pharmacies",
      value: counters.pharmacies,
      suffix: "+",
      icon: Building2,
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {statItems.map((stat, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center shadow-sm"
            >
              <div
                className={`p-4 rounded-xl mb-4 transition-transform group-hover:scale-110 duration-300 ${stat.bg}`}
              >
                <stat.icon className={`w-8 h-8 ${stat.text}`} />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                {stat.value.toLocaleString()}
                <span className={`text-2xl ml-1 ${stat.text}`}>
                  {stat.suffix}
                </span>
              </p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
