import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function RevenueTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 font-sans">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-extrabold text-slate-900">Revenue Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly revenue performance with growth analysis</p>
        </div>
        <EmptyState title="No revenue data available" />
      </div>
    );
  }

  const avgRevenue = Math.round(data.reduce((sum, d) => sum + (d.revenue || 0), 0) / data.length);
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

  const firstRevenue = data[0]?.revenue || 0;
  const lastRevenue = data[data.length - 1]?.revenue || 0;
  const isGrowth = lastRevenue >= firstRevenue;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-md text-xs font-sans">
          <p className="font-bold text-slate-700 mb-1">{data.month}</p>
          <p className="font-extrabold text-blue-600">${data.revenue?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Revenue Trend Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Track revenue trajectory over time</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isGrowth ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {isGrowth ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>${totalRevenue.toLocaleString()} Total</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#revGradLight)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
