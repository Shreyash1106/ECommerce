import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function RevenueTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Revenue Trend</h3>
          <p className="text-xs text-gray-500 mt-1">Monthly revenue performance with growth analysis</p>
        </div>
        <div className="p-5">
          <EmptyState title="No revenue data available" />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1);
  const minRevenue = Math.min(...data.map(d => d.revenue || 0), 0);
  const avgRevenue = Math.round(data.reduce((sum, d) => sum + (d.revenue || 0), 0) / data.length);
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

  const firstRevenue = data[0]?.revenue || 0;
  const lastRevenue = data[data.length - 1]?.revenue || 0;
  const growthPercentage = firstRevenue > 0 ? (((lastRevenue - firstRevenue) / firstRevenue) * 100).toFixed(1) : 0;
  const isGrowth = lastRevenue >= firstRevenue;

  const highestMonth = data.reduce((max, d) => (d.revenue || 0) > (max.revenue || 0) ? d : max);
  const lowestMonth = data.reduce((min, d) => (d.revenue || 0) < (min.revenue || 0) ? d : min);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-950/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
          <p className="text-xs font-semibold text-gray-300 mb-2">{data.month}</p>
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">₹{data.revenue?.toLocaleString()}</p>
          {data.percent_change && (
            <p className={`text-xs ${data.percent_change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Change: {data.percent_change > 0 ? "+" : ""}{data.percent_change}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="section-card bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl border border-gray-800/50">
      <div className="px-6 py-5 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Monthly performance with growth analysis</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">₹{(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-2">{data.length} months</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-transparent border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Average</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-500">₹{(avgRevenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-2">Per month</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Peak</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">₹{(maxRevenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-2">{highestMonth.month}</p>
          </div>
          <div className={`bg-gradient-to-br ${isGrowth ? "from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20" : "from-rose-500/10 via-rose-600/5 to-transparent border border-rose-500/20"} rounded-xl p-4 hover:border-${isGrowth ? "emerald" : "rose"}-500/40 transition-all`}>
            <p className="text-xs text-gray-400 mb-2 font-medium">Growth</p>
            <div className="flex items-center gap-2">
              {isGrowth ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
              <p className={`text-2xl font-bold ${isGrowth ? "text-emerald-400" : "text-rose-400"}`}>
                {growthPercentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 mb-6">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: "#6b6b84" }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#6b6b84" }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={avgRevenue} 
                stroke="#0ea5e9" 
                strokeDasharray="5 5" 
                opacity={0.4}
                label={{ value: `Avg: ₹${(avgRevenue / 1000).toFixed(1)}K`, position: "right", fill: "#0ea5e9", fontSize: 10 }}
              />
              <Area 
                type="natural" 
                dataKey="revenue" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenueTrend)"
                isAnimationActive={true}
                animationDuration={1000}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Highest Month</p>
            <p className="text-lg font-bold text-emerald-400">
              ₹{(highestMonth.revenue / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {highestMonth.month}
            </p>
          </div>
          <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-xl p-4 hover:border-rose-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Lowest Month</p>
            <p className="text-lg font-bold text-rose-400">
              ₹{(lowestMonth.revenue / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {lowestMonth.month}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-xl p-4 hover:border-violet-500/40 transition-all">
            <p className="text-xs text-gray-400 mb-2 font-medium">Avg Monthly</p>
            <p className="text-lg font-bold text-violet-400">
              ₹{(avgRevenue / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {data.length} months
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl">
          <p className="text-xs text-gray-400 mb-3 font-medium">Revenue Distribution</p>
          <div className="flex items-end gap-1 h-12">
            {data?.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-500 via-cyan-500 to-emerald-400 rounded-t opacity-80 hover:opacity-100 transition-opacity shadow-lg hover:shadow-cyan-500/50"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                title={`${d.month}: ₹${d.revenue?.toLocaleString()}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
