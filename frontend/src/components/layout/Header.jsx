import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, User, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../store/useStore";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/analytics": "Analytics",
  "/admin/notifications": "Notifications",
  "/vendor/dashboard": "Vendor Dashboard",
  "/vendor/products": "My Products",
  "/vendor/orders": "My Orders",
  "/vendor/analytics": "Analytics",
  "/settings": "Settings",
  "/profile": "Profile",
};

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useQuery({
    queryKey: ["notifications"],
    queryFn: () => client.get("/notifications").then((r) => r.data),
    onSuccess: (data) => setUnreadCount(data?.unread_count ?? data?.notifications?.filter((n) => !n.is_read).length ?? 0),
    refetchInterval: 30000,
    retry: 1,
  });

  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  if (isAuthPage) return null;

  const title = PAGE_TITLES[location.pathname] || "CommerceOS";
  
  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.username || "User";
  
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-6 flex-shrink-0 z-40 sticky top-0 shadow-sm">
      <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <button
          onClick={() => navigate("/admin/notifications")}
          className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 border border-slate-200/60 shadow-sm"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-slate-950 flex items-center justify-center leading-none ring-2 ring-white shadow-md animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-slate-200 hidden md:block mx-1"></div>

        {/* User Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200/60 shadow-sm group"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-sm ring-1 ring-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 group-hover:bg-amber-500/20 transition-all">
              {initials}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-slate-800 leading-none group-hover:text-slate-950 transition-colors">{displayName}</span>
            <span className="text-[10px] text-slate-500 font-bold capitalize leading-none mt-1">{user?.role || "admin"}</span>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1 group-hover:text-slate-600 hidden md:block transition-colors" />
        </button>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="relative p-2.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/60 shadow-sm transition-all duration-200 ml-1 group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
