import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const up = trend === "up";
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      {trendValue !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{trendValue}% from last month</span>
        </div>
      )}
    </div>
  );
}
