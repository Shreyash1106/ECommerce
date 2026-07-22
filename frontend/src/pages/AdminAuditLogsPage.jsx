import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FileText, Activity, ShieldCheck, AlertCircle, Users, HardDrive,
  Clock, LayoutDashboard, Package, ShoppingCart, BarChart3, Bell,
  Image, Settings
} from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
  { label: "CMS Banners", icon: Image, to: "/admin/cms" },
  { label: "Site Settings", icon: Settings, to: "/admin/settings" },
  { label: "Audit Logs", icon: FileText, to: "/admin/audit-logs" },
];

const INITIAL_LOGS = [
  { id: "LOG-98401", action: "Updated Site Config", user: "Admin (admin@example.com)", target: "Tax & Shipping Rules", time: "Jul 22, 2026 - 16:30", status: "Success" },
  { id: "LOG-98398", action: "Approved Vendor Store", user: "Admin (admin@example.com)", target: "Apex Electronics Store", time: "Jul 22, 2026 - 15:45", status: "Success" },
  { id: "LOG-98350", action: "Created Coupon Campaign", user: "Admin (admin@example.com)", target: "SAVE10 (10% OFF)", time: "Jul 21, 2026 - 11:20", status: "Success" },
  { id: "LOG-98310", action: "Overrode Return Approval", user: "Admin (admin@example.com)", target: "Return #RET-98401", time: "Jul 20, 2026 - 09:15", status: "Success" },
  { id: "LOG-98290", action: "Published Hero Banner", user: "Admin (admin@example.com)", target: "Summer Electronics Fest", time: "Jul 19, 2026 - 14:00", status: "Success" },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 px-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Monitoring & Audit Logs</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time system telemetry, server health metrics, and administrative action audit history.</p>
        </div>

        {/* System Monitoring Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Concurrent Users" value="1,840 Active" icon={Users} color="blue" trend="up" trendValue={14.2} />
          <StatCard title="Server CPU Load" value="14.2% (Healthy)" icon={Activity} color="green" trend="up" trendValue={0} />
          <StatCard title="Memory Allocation" value="4.2 GB / 16 GB" icon={HardDrive} color="purple" trend="up" trendValue={0} />
          <StatCard title="System Security Status" value="100% Secure" icon={ShieldCheck} color="amber" trend="up" trendValue={0} />
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Administrative Action Audit Trail</h3>
            <span className="text-xs font-bold text-slate-500">{logs.length} Total Audit Records Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Log ID</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Action Executed</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Admin User</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Target Resource</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Timestamp</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-blue-600 font-bold">{log.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{log.action}</td>
                    <td className="p-3.5 text-slate-600">{log.user}</td>
                    <td className="p-3.5 text-slate-700">{log.target}</td>
                    <td className="p-3.5 text-slate-500">{log.time}</td>
                    <td className="p-3.5 text-center">
                      <Badge status="active">{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} total={logs.length} pageSize={5} onChange={setPage} />
        </div>

      </div>
    </div>
  );
}
