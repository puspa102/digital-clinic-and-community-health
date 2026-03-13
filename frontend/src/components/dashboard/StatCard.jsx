const StatCard = ({ label, value, icon: Icon, colorClass, loading }) => {
  return (
    <div className={`relative overflow-hidden ${colorClass} rounded-2xl p-6 shadow-lg transition-transform hover:-translate-y-1 duration-300`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <span className="text-xs font-bold tracking-widest text-white/80 uppercase">{label}</span>
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="relative z-10">
        {loading ? (
          <div className="h-8 w-16 bg-white/20 animate-pulse rounded"></div>
        ) : (
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
