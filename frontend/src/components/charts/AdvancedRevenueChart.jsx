import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function AdvancedRevenueChart({ data }) {
  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Revenue Trend (Advanced)</h3>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #333", borderRadius: "8px" }}
              formatter={(value) => `₹${value?.toLocaleString()}`}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
