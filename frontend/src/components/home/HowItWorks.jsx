import { UserPlus, CalendarCheck, Stethoscope, ArrowRight } from "lucide-react";

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
    <section
      id="how-it-works"
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-900/50"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 mb-6">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              ✨ Simple Process
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Getting the care you need is simple. Follow these three easy steps
            to start your healthcare journey.
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
          {/* Connector Line (Desktop) with gradient */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-teal-400 via-indigo-400 to-cyan-400 -z-10 rounded-full shadow-lg shadow-teal-400/30"></div>

          {/* Arrow separators (Desktop) */}
          <div className="hidden md:flex absolute top-11 left-1/3 translate-x-1/2 -translate-y-1/2 z-20">
            <ArrowRight className="text-teal-400 w-6 h-6 -rotate-90" />
          </div>
          <div className="hidden md:flex absolute top-11 right-1/3 translate-x-1/2 -translate-y-1/2 z-20">
            <ArrowRight className="text-indigo-400 w-6 h-6 -rotate-90" />
          </div>

          {/* Step Cards */}
          {steps.map((item, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center group animate-in fade-in duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Main Card Container */}
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-3 border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl flex items-center justify-center mb-8 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:border-teal-400 dark:group-hover:border-teal-600">
                {/* Animated gradient overlay on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/0 to-indigo-500/0 group-hover:from-teal-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />

                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-teal-500/40 group-hover:shadow-teal-500/60 transition-all group-hover:scale-110">
                  {item.step}
                </div>

                {/* Icon */}
                <item.icon className="w-12 h-12 text-teal-600 dark:text-teal-400 transition-transform group-hover:scale-125 duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto text-sm sm:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 text-center animate-in fade-in duration-500"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to get started?
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
