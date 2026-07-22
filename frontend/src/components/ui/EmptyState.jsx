import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "No data found", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center font-sans">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-extrabold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
