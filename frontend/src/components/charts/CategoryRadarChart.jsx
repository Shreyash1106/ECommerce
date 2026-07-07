import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";

export default function CategoryRadarChart({ data }) {
  const chartData = data.map((cat, idx) => ({
    name: cat.name,
    value: cat.value,
    fill: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"][idx % 6],
  }));

  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Category Distribution (Radar)</h3>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#9494a8" }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: "#6b6b84" }} />
            <Radar name="Sales" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #333", borderRadius: "8px" }}
              formatter={(value) => `₹${value?.toLocaleString()}`}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
