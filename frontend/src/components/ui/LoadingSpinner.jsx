import React from "react";

const sizes = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-[3px]" };

export default function LoadingSpinner({ size = "md", className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-700 border-t-indigo-500 ${sizes[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
