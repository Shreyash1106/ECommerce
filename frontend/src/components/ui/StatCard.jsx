import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = "indigo", onClick }) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.15)]",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    green: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    red: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  };
  const up = trend === "up";
  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl hover:bg-gray-800/60 group' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-300 ${onClick ? 'group-hover:scale-110' : ''} ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-2 relative z-10 tracking-tight">{value}</p>
      {trendValue !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold relative z-10 ${up ? "text-emerald-400" : "text-rose-400"}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}% from last month</span>
        </div>
      )}
      
      {/* Decorative gradient blob */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-20 pointer-events-none transition-opacity duration-300 ${onClick ? 'group-hover:opacity-40' : ''} ${
        color === 'indigo' ? 'bg-indigo-500' : 
        color === 'teal' ? 'bg-teal-500' : 
        color === 'amber' ? 'bg-amber-500' : 
        'bg-emerald-500'
      }`} />
    </div>
  );
}
