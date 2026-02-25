import React from "react";

const Loading = ({ message = "Loading...", color = "purple" }) => {
  const colorClass = color === "blue" ? "border-blue-600" : "border-purple-600";

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <div className={`w-8 h-8 border-4 ${colorClass} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default Loading;
