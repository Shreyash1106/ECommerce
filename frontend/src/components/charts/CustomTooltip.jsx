import React from "react";

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-950/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold tracking-tight">
          {p.dataKey === "revenue" || p.name === "revenue"
            ? `$${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};
