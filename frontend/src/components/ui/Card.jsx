import React from "react";

export default function Card({ children, className = "", title, action }) {
  return (
    <div className={`section-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          {title && <h3 className="text-sm font-semibold text-gray-200">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
