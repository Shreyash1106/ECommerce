import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, total, pageSize = 10, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
      <p className="text-xs text-gray-500">
        Showing <span className="text-gray-300">{start}–{end}</span> of <span className="text-gray-300">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                p === page ? "bg-indigo-600 text-white" : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
