import React from "react";

const variants = {
  default: "bg-slate-100 text-slate-700 border border-slate-200",
  indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  yellow: "bg-amber-50 text-amber-800 border border-amber-300",
  red: "bg-rose-50 text-rose-700 border border-rose-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  orange: "bg-orange-50 text-orange-700 border border-orange-200",
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
