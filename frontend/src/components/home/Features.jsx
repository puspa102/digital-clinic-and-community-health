import {
  Calendar,
  Pill,
  FileText,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Book appointments instantly with top-rated doctors. Choose time slots that fit your busy life.",
      color: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Pill,
      title: "Digital Prescriptions",
      description:
        "Receive e-prescriptions directly from your doctor and forward them to nearby pharmacies.",
      color: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: FileText,
      title: "Medical Records",
      description:
        "Securely store and access your complete medical history, reports, and lab results in one place.",
      color: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Building2,
      title: "Pharmacy Network",
      description:
        "Connect with a vast network of verified pharmacies for medicine availability and delivery.",
      color: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description:
        "Track your vitals and health progress over time with intuitive charts and insights.",
      color: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description:
        "Your health data is protected with enterprise-grade encryption and privacy standards.",
      color: "bg-cyan-100 dark:bg-cyan-900/30",
      textColor: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&q=80&w=2071"
          alt="Medical Abstract Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-gray-950 dark:via-transparent dark:to-gray-950 opacity-80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mb-2">
            Features
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Better Health
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A comprehensive suite of tools designed to simplify your healthcare
            journey from consultation to recovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}
              >
                <feature.icon className={`w-6 h-6 ${feature.textColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
