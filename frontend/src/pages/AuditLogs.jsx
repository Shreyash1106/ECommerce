import React from "react";
import { Shield } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

export default function AuditLogs() {
  return (
    <div className="page-container">
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-indigo-400" />
        <h1 className="text-lg font-semibold text-white">Audit Logs</h1>
      </div>
      <div className="section-card">
        <EmptyState icon={Shield} title="No audit logs available" description="Audit log tracking is not yet configured on the backend." />
      </div>
    </div>
  );
}
