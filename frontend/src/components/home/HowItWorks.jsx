import { UserPlus, CalendarCheck, Stethoscope } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Create Profile",
      description:
        "Sign up and build your personal health profile. It's secure, private, and takes less than 2 minutes.",
      icon: UserPlus,
    },
    {
      step: "02",
      title: "Book Appointment",
      description:
        "Browse top-rated doctors, view their availability, and book a slot that works for your schedule.",
      icon: CalendarCheck,
    },
    {
      step: "03",
      title: "Get Treatment",
      description:
        "Consult with your doctor, receive digital prescriptions, and track your recovery journey.",
      icon: Stethoscope,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mb-2">
            Process
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Getting the care you need is simple. Follow these three easy steps
            to start your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>

          {steps.map((item, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-xl flex items-center justify-center mb-8 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-blue-500/30">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <item.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
