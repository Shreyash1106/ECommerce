import React, { useState } from "react";
import { Bell, ShoppingCart, User, Settings2, AlertTriangle, CheckCheck, Trash2, Circle, LayoutDashboard, Package, BarChart3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import client from "../api/client";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const TYPE_META = {
  order:  { icon: ShoppingCart,  color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",   title: "Order Update" },
  user:   { icon: User,          color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", title: "User Activity" },
  stock:  { icon: AlertTriangle, color: "text-amber-600",  bg: "bg-amber-50 border-amber-200", title: "Stock Alert" },
  system: { icon: Settings2,     color: "text-purple-600", bg: "bg-purple-50 border-purple-200", title: "System" },
};

const TABS = ["All", "Unread", "Orders", "Users", "System"];

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: User, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

export default function AdminNotifications() {
  const [tab, setTab] = useState("All");
  const queryClient = useQueryClient();

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => client.get("/notifications").then((r) => r.data),
    retry: 1,
  });

  const rawList = apiData?.notifications || [];
  const unread = apiData?.unread_count ?? rawList.filter((n) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => client.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => client.post("/notifications/read-all"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast.success("All marked as read."); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const filtered = rawList.filter((n) => {
    if (tab === "Unread")  return !n.is_read;
    if (tab === "Orders")  return n.type === "order";
    if (tab === "Users")   return n.type === "user";
    if (tab === "System")  return n.type === "system" || n.type === "stock";
    return true;
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {ADMIN_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {t.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
            {unread > 0 && <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-full">{unread} unread</span>}
          </div>
          {unread > 0 && (
            <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-xs flex items-center gap-1.5">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-2 border-b border-slate-200 pb-3">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div key={n.id}
                  className={`bg-white border border-slate-200/80 rounded-2xl flex items-start gap-4 p-5 hover:shadow-md transition-all cursor-pointer ${!n.is_read ? "border-l-4 border-l-blue-600" : ""}`}
                  onClick={() => markReadMutation.mutate(n.id)}>
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} border flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.is_read && <Circle size={8} className="text-amber-500 fill-amber-500" />}
                        <span className="text-[11px] text-slate-400 font-semibold">{n.created_at ? timeAgo(n.created_at) : ""}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
