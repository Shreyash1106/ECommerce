import React, { useState } from "react";
import { Bell, ShoppingCart, User, Settings2, AlertTriangle, CheckCheck, Trash2, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const TYPE_META = {
  order:  { icon: ShoppingCart,  color: "text-blue-400",   bg: "bg-blue-500/10",   title: "Order Update" },
  user:   { icon: User,          color: "text-green-400",  bg: "bg-green-500/10",  title: "User Activity" },
  stock:  { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", title: "Stock Alert" },
  system: { icon: Settings2,     color: "text-indigo-400", bg: "bg-indigo-500/10", title: "System" },
};

const TABS = ["All", "Unread", "Orders", "Users", "System"];

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
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Notifications</h1>
          {unread > 0 && <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-800">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            {t}
            {t === "Unread" && unread > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px]">{unread}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="section-card">
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            const Icon = meta.icon;
            return (
              <div key={n.id}
                className={`section-card flex items-start gap-4 px-5 py-4 hover:border-gray-700 transition-all cursor-pointer ${!n.is_read ? "border-l-2 border-l-indigo-500" : ""}`}
                onClick={() => markReadMutation.mutate(n.id)}>
                <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={16} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${!n.is_read ? "text-white" : "text-gray-300"}`}>{meta.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message || n.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.is_read && <Circle size={7} className="text-indigo-500 fill-indigo-500" />}
                      <span className="text-[11px] text-gray-600 whitespace-nowrap">{n.created_at ? timeAgo(n.created_at) : ""}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                        className="p-1 rounded hover:bg-gray-700 text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
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
  );
}
