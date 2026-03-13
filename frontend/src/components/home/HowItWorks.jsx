import { UserCheck, Calendar, Heart, ChevronRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up as a patient, doctor, or pharmacy. Quick verification process.",
      icon: UserCheck,
      color: "blue",
    },
    {
      step: "02",
      title: "Book Appointment",
      description: "Choose your doctor, select a convenient time, and confirm your booking.",
      icon: Calendar,
      color: "green",
    },
    {
      step: "03",
      title: "Get Care",
      description: "Visit the doctor, receive prescriptions, and order medicines digitally.",
      icon: Heart,
      color: "purple",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-[12px] font-semibold text-green-600 dark:text-green-400 mb-4 border border-green-100 dark:border-green-800/50">
            How it Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple Steps to Better Health
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 dark:from-blue-800 dark:via-green-800 dark:to-purple-800 z-0"></div>

          {steps.map((item, i) => (
            <div key={i} className="relative z-10 group">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative">
                  <span className={`text-6xl font-black opacity-40 ${
                    item.color === "blue" ? "text-blue-100 dark:text-blue-900/30" :
                    item.color === "green" ? "text-green-100 dark:text-green-900/30" :
                    "text-purple-100 dark:text-purple-900/30"
                  }`}>
                    {item.step}
                  </span>
                  <div className={`absolute top-4 -right-2 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                    item.color === "blue" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                    item.color === "green" ? "bg-gradient-to-br from-green-400 to-green-600" :
                    "bg-gradient-to-br from-purple-400 to-purple-600"
                  }`}>
                    <item.icon size={28} className="text-white" />
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
