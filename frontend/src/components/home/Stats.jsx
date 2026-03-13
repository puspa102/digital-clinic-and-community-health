import { Stethoscope, Users, Calendar, Building2 } from "lucide-react";

const Stats = ({ counters }) => {
  const statItems = [
    { label: "Doctors", value: counters.doctors, suffix: "+", icon: Stethoscope, color: "blue" },
    { label: "Happy Patients", value: counters.patients, suffix: "+", icon: Users, color: "green" },
    { label: "Appointments", value: counters.appointments, suffix: "+", icon: Calendar, color: "purple" },
    { label: "Pharmacies", value: counters.pharmacies, suffix: "+", icon: Building2, color: "orange" },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-100/50 dark:border-gray-800/50 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-1 shadow-sm ${
                stat.color === "blue" ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800" :
                stat.color === "green" ? "bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800" :
                stat.color === "purple" ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800" :
                "bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800"
              }`}>
                <stat.icon size={28} className={
                  stat.color === "blue" ? "text-blue-500" :
                  stat.color === "green" ? "text-green-500" :
                  stat.color === "purple" ? "text-purple-500" :
                  "text-orange-500"
                } />
              </div>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {stat.value.toLocaleString()}<span className={
                  stat.color === "blue" ? "text-blue-500" :
                  stat.color === "green" ? "text-green-500" :
                  stat.color === "purple" ? "text-purple-500" :
                  "text-orange-500"
                }>{stat.suffix}</span>
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
