import React from "react";

export const gradientDefs = (id, startColor, endColor, startOpacity = 0.3, endOpacity = 0) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={startColor} stopOpacity={startOpacity} />
      <stop offset="95%" stopColor={endColor} stopOpacity={endOpacity} />
    </linearGradient>
  </defs>
);

export const gridStyle = {
  stroke: "#2d2d2d",
  strokeDasharray: "3 3",
};

export const axisTickStyle = {
  fontSize: 11,
  fill: "#6b6b84",
};
export const colorPalette = {
  primary: '#6366f1',
  secondary: '#14b8a6',
  accent: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};
