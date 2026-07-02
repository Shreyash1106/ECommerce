import React from "react";

const variants = {
  default: "bg-gray-700/50 text-gray-300 border border-gray-600/50",
  indigo: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  green: "bg-green-500/15 text-green-400 border border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  red: "bg-red-500/15 text-red-400 border border-red-500/30",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  orange: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
};

const statusMap = {
  active: "green", inactive: "red", pending: "yellow",
  processing: "blue", shipped: "indigo", delivered: "green",
  cancelled: "red", admin: "purple", vendor: "blue", customer: "default",
  "in stock": "green", "low stock": "yellow", "out of stock": "red",
};

export default function Badge({ children, variant, status }) {
  const v = variant || statusMap[String(children || status || "").toLowerCase()] || "default";
  return (
    <span className={`badge ${variants[v] || variants.default}`}>
      {children}
    </span>
  );
}
