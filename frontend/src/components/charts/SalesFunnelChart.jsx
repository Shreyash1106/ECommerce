import React from "react";

export default function SalesFunnelChart({ data }) {
  const funnelData = [
    { name: "Visitors", value: 10000, color: "#6366f1" },
    { name: "Product Views", value: 7500, color: "#8b5cf6" },
    { name: "Add to Cart", value: 4200, color: "#ec4899" },
    { name: "Checkout", value: 2100, color: "#f59e0b" },
    { name: "Completed", value: 1500, color: "#10b981" },
  ];

  const maxValue = Math.max(...funnelData.map(d => d.value));

  return (
    <div className="section-card">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Sales Funnel</h3>
      </div>
      <div className="p-5 space-y-4">
        {funnelData.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          const conversionRate = idx > 0 ? ((item.value / funnelData[idx - 1].value) * 100).toFixed(1) : 100;
          
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-300">{item.name}</span>
                <span className="text-xs text-gray-500">{item.value.toLocaleString()} ({conversionRate}%)</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <span className="text-xs font-semibold text-white">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
