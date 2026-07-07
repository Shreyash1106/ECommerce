import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function ProductScatterChart({ data }) {
  const scatterData = data.map((product, idx) => ({
    name: product.name,
    sales: product.sales,
    rating: Math.random() * 5,
    size: product.sales * 2,
  }));

  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Product Performance (Scatter)</h3>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
            <XAxis type="number" dataKey="sales" name="Sales" tick={{ fontSize: 11, fill: "#6b6b84" }} />
            <YAxis type="number" dataKey="rating" name="Rating" tick={{ fontSize: 11, fill: "#6b6b84" }} />
            <Tooltip 
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #333", borderRadius: "8px" }}
              formatter={(value, name) => {
                if (name === "Sales") return `${value} units`;
                if (name === "Rating") return `${value.toFixed(1)} ⭐`;
                return value;
              }}
            />
            <Scatter name="Products" data={scatterData} fill="#6366f1" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
