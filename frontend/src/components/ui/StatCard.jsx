import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = "indigo", onClick }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
    teal: "bg-teal-50 text-teal-600 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };
  const up = trend === "up";
  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-slate-300 hover:shadow-md group' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-300 ${onClick ? 'group-hover:scale-110' : ''} ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold text-slate-900 mb-2 relative z-10 tracking-tight">{value}</p>
      {trendValue !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-bold relative z-10 ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}% from last month</span>
        </div>
      )}
    </div>
  );
}
