import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function DailyOrdersChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Daily Orders (Last 30 Days)</h3>
          <p className="text-xs text-gray-500 mt-1">Performance heatmap with trend analysis</p>
        </div>
        <div className="p-5">
          <EmptyState title="No order data available" />
        </div>
      </div>
    );
  }

  const maxOrders = Math.max(...data.map(d => d.orders || 0), 1);
  const minOrders = Math.min(...data.map(d => d.orders || 0), 0);
  const avgOrders = Math.round(data.reduce((sum, d) => sum + (d.orders || 0), 0) / data.length);
  const totalOrders = data.reduce((sum, d) => sum + (d.orders || 0), 0);

  const bestDay = data.reduce((max, d) => (d.orders || 0) > (max.orders || 0) ? d : max);
  const worstDay = data.reduce((min, d) => (d.orders || 0) < (min.orders || 0) ? d : min);

  const getColor = (value) => {
    const percentage = (value - minOrders) / (maxOrders - minOrders);
    if (percentage < 0.25) return "#f87171";
    if (percentage < 0.5) return "#fb923c";
    if (percentage < 0.75) return "#fbbf24";
    return "#34d399";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.orders - minOrders) / (maxOrders - minOrders) * 100).toFixed(1);
      return (
        <div className="bg-gray-950/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
          <p className="text-xs font-semibold text-gray-300 mb-2">{data.date}</p>
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-1">{data.orders} Orders</p>
          <p className="text-xs text-gray-400">Performance: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="section-card bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl border border-gray-800/50">
      <div className="px-6 py-5 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg border border-orange-500/30">
            <Calendar className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Daily Orders (Last 30 Days)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Performance heatmap with trend analysis</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">{totalOrders}</p>
            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Average</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">{avgOrders}</p>
            <p className="text-xs text-gray-500 mt-2">Per day</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Peak</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">{maxOrders}</p>
            <p className="text-xs text-gray-500 mt-2">{bestDay.date}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-600/5 to-transparent border border-rose-500/20 rounded-xl p-4 hover:border-rose-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Low</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-500">{minOrders}</p>
            <p className="text-xs text-gray-500 mt-2">{worstDay.date}</p>
          </div>
        </div>

        <div className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: "#6b6b84" }} 
                axisLine={false} 
                tickLine={false}
                interval={Math.floor((data?.length || 0) / 10)}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#6b6b84" }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" radius={[6, 6, 0, 0]} name="Orders" animationDuration={800}>
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.orders)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-300">Performance Scale</p>
            <p className="text-xs text-gray-500">Low → High</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-90 shadow-lg" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-gray-400 font-medium">Best Day</p>
            </div>
            <p className="text-lg font-bold text-emerald-400">
              {bestDay.date}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {bestDay.orders} orders
            </p>
          </div>
          <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-xl p-4 hover:border-rose-500/40 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-rose-400 rotate-180" />
              <p className="text-xs text-gray-400 font-medium">Worst Day</p>
            </div>
            <p className="text-lg font-bold text-rose-400">
              {worstDay.date}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {worstDay.orders} orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
