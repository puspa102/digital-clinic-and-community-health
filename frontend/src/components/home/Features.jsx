import {
  Calendar,
  Pill,
  FileText,
  Building2,
  ShieldCheck,
  Activity,
  Zap,
  Brain,
  Lock,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

const Features = () => {
  const featureGroups = [
    {
      category: "Clinical Services",
      color: "teal-600",
      features: [
        {
          icon: Calendar,
          title: "Smart Scheduling",
          description:
            "Book appointments with specialist doctors instantly. Choose from flexible time slots that fit your schedule perfectly.",
          gradient:
            "from-teal-100 to-teal-100 dark:from-teal-900/30 dark:to-teal-900/30",
          iconColor: "text-teal-600 dark:text-teal-400",
          accent: "bg-teal-500",
        },
        {
          icon: Activity,
          title: "Live Consultations",
          description:
            "Connect with doctors via secure video calls, chat, or voice. Premium quality healthcare from your comfort.",
          gradient:
            "from-cyan-100 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-900/30",
          iconColor: "text-cyan-600 dark:text-cyan-400",
          accent: "bg-cyan-500",
        },
        {
          icon: Brain,
          title: "Health Analytics",
          description:
            "AI-powered health insights and personalized recommendations based on your medical history.",
          gradient:
            "from-sky-100 to-sky-100 dark:from-sky-900/30 dark:to-sky-900/30",
          iconColor: "text-sky-600 dark:text-sky-400",
          accent: "bg-sky-500",
        },
      ],
    },
    {
      category: "Prescriptions & Pharmacy",
      color: "emerald-600",
      features: [
        {
          icon: Pill,
          title: "Digital Prescriptions",
          description:
            "Receive e-prescriptions directly from your doctor. Share instantly with pharmacies for seamless fulfillment.",
          gradient:
            "from-emerald-100 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/30",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          accent: "bg-emerald-500",
        },
        {
          icon: Building2,
          title: "Pharmacy Network",
          description:
            "Access a vast network of verified pharmacies. Check availability, pricing, and get fast delivery to your doorstep.",
          gradient:
            "from-green-100 to-green-100 dark:from-green-900/30 dark:to-green-900/30",
          iconColor: "text-green-600 dark:text-green-400",
          accent: "bg-green-500",
        },
        {
          icon: TrendingUp,
          title: "Inventory Tracking",
          description:
            "Real-time medicine availability updates. Get notified when your prescribed medications are in stock.",
          gradient:
            "from-lime-100 to-lime-100 dark:from-lime-900/30 dark:to-lime-900/30",
          iconColor: "text-lime-600 dark:text-lime-400",
          accent: "bg-lime-500",
        },
      ],
    },
    {
      category: "Medical Records & Security",
      color: "violet-600",
      features: [
        {
          icon: FileText,
          title: "Medical Records",
          description:
            "Securely store your complete health history, reports, and lab results in one encrypted vault.",
          gradient:
            "from-violet-100 to-violet-100 dark:from-violet-900/30 dark:to-violet-900/30",
          iconColor: "text-violet-600 dark:text-violet-400",
          accent: "bg-violet-500",
        },
        {
          icon: ShieldCheck,
          title: "HIPAA Compliant",
          description:
            "Enterprise-grade encryption and privacy standards. Your health data is protected with military-level security.",
          gradient:
            "from-purple-100 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/30",
          iconColor: "text-purple-600 dark:text-purple-400",
          accent: "bg-purple-500",
        },
        {
          icon: Lock,
          title: "Data Privacy",
          description:
            "You own your data. Control who accesses your information with granular permission settings.",
          gradient:
            "from-fuchsia-100 to-fuchsia-100 dark:from-fuchsia-900/30 dark:to-fuchsia-900/30",
          iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
          accent: "bg-fuchsia-500",
        },
      ],
    },
    {
      category: "Community & Support",
      color: "orange-600",
      features: [
        {
          icon: Users,
          title: "Patient Community",
          description:
            "Connect with other patients, share experiences, and find support from a caring community.",
          gradient:
            "from-orange-100 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/30",
          iconColor: "text-orange-600 dark:text-orange-400",
          accent: "bg-orange-500",
        },
        {
          icon: Award,
          title: "Quality Assurance",
          description:
            "All doctors are verified professionals with certifications. Ratings and reviews ensure quality care.",
          gradient:
            "from-amber-100 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/30",
          iconColor: "text-amber-600 dark:text-amber-400",
          accent: "bg-amber-500",
        },
        {
          icon: Zap,
          title: "24/7 Support",
          description:
            "Round-the-clock customer support via chat, email, or phone. We're always here when you need us.",
          gradient:
            "from-yellow-100 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/30",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          accent: "bg-yellow-500",
        },
      ],
    },
  ];

  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 max-w-7xl mx-auto mb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 mb-6">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Premium Features
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Everything You Need for Better Health
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
            A comprehensive suite of premium healthcare tools designed to
            simplify your medical journey from consultation to recovery.
          </p>
        </div>
      </div>

      {/* Features Groups */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-20">
        {featureGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="group">
            {/* Category Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-3xl font-bold text-${group.color}`}>
                  {group.category}
                </h3>
              </div>
              <div className={`h-1 w-20 bg-${group.color} rounded-full`} />
            </div>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {group.features.map((feature, featureIndex) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={featureIndex}
                    className={`group/card card bg-${feature.gradient.split(" ")[0].replace("from-", "")} border border-white/50 dark:border-white/10 hover:border-white/80 dark:hover:border-white/20 p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative`}
                  >
                    {/* Animated Background Shine */}
                    <div className="absolute inset-0 bg-white/0 opacity-0 group-hover/card:opacity-5 transition-opacity duration-500" />

                    {/* Icon Container */}
                    <div
                      className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${feature.gradient.split(" ")[0].replace("from-", "")} border border-white/30 shadow-lg mb-6 group-hover/card:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        className={`relative z-10 w-8 h-8 ${feature.iconColor}`}
                      />
                    </div>

                    {/* Content */}
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10 group-hover/card:text-teal-600 dark:group-hover/card:text-teal-400 transition-all">
                      {feature.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed relative z-10 font-semibold">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <div className="mt-6 pt-6 border-t border-white/20 relative z-10 flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover/card:text-teal-600 dark:group-hover/card:text-teal-400 transition-colors">
                      Learn more
                      <svg
                        className="w-4 h-4 ml-2 group-hover/card:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <div className="relative z-10 mt-24">
        <div className="max-w-4xl mx-auto bg-teal-600/10 dark:bg-teal-600/5 border border-teal-200 dark:border-teal-700/30 rounded-3xl p-12 lg:p-16 text-center backdrop-blur-xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-semibold">
            Join thousands of patients and doctors who trust our platform for
            better health outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Today
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 font-bold rounded-xl border-2 border-teal-200 dark:border-teal-700/50 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 hover:-translate-y-1"
            >
              See Pricing Plans
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
