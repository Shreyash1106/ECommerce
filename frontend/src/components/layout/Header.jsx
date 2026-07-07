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
  const hideSearch = location.pathname === "/settings";
  
  // Get user display name from first_name and last_name
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
    <header className="h-16 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 z-40 sticky top-0">
      <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <button
          onClick={() => navigate("/admin/notifications")}
          className="relative p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10 shadow-sm"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-gray-950 shadow-md animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-gray-800 hidden md:block mx-1"></div>

        {/* User Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10 group"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-sm ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 group-hover:bg-indigo-600/30 transition-all">
              {initials}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-200 leading-none group-hover:text-white transition-colors">{displayName}</span>
            <span className="text-[10px] text-gray-500 font-medium capitalize leading-none mt-1">{user?.role || "admin"}</span>
          </div>
          <ChevronDown size={14} className="text-gray-500 ml-1 group-hover:text-gray-300 hidden md:block transition-colors" />
        </button>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="relative p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200 ml-1 group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
