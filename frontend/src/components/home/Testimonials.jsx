import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      category: "Doctor",
      content:
        "Digital Clinic has revolutionized how I manage my practice. The patient history access is a game-changer for diagnosis.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80",
      color:
        "from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30",
      accent: "text-teal-600 dark:text-teal-400",
    },
    {
      name: "Michael Chen",
      role: "Patient",
      category: "Patient",
      content:
        "I used to wait hours at clinics. Now I book appointments instantly and get my prescriptions on my phone. Incredible!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      color:
        "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "Priya Patel",
      role: "Pharmacist",
      category: "Pharmacy",
      content:
        "Inventory management and processing digital prescriptions has never been smoother. It saves us so much time.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
      color:
        "from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 relative overflow-hidden"
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
              ⭐ Real Testimonials
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Loved by Thousands
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Hear from the doctors, patients, and pharmacy partners who trust
            Digital Clinic daily
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-8"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Animated gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 text-teal-200 dark:text-teal-900/30 w-12 h-12 group-hover:text-teal-300 dark:group-hover:text-teal-800/50 transition-colors" />

              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${item.color} ${item.accent}`}
                >
                  {item.category}
                </span>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(item.rating)].map((_, j) => (
                  <Star
                    key={j}
                    size={18}
                    className="text-amber-400 fill-amber-400 drop-shadow-sm"
                  />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed relative z-10 font-medium">
                "{item.content}"
              </p>

              {/* Author Section */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-full object-cover border-3 border-gray-200 dark:border-gray-600 shadow-md group-hover:shadow-lg transition-shadow group-hover:scale-110 transition-transform duration-300"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className={`text-xs font-semibold ${item.accent}`}>
                    {item.role}
                  </p>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-0 bg-gradient-to-r from-teal-500 to-indigo-500 group-hover:w-2/3 transition-all duration-300 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
