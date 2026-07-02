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
};

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = React.useState(false);
  const dropRef = useRef(null);

  useQuery({
    queryKey: ["notifications"],
    queryFn: () => client.get("/notifications").then((r) => r.data),
    onSuccess: (data) => setUnreadCount(data?.unread_count ?? data?.notifications?.filter((n) => !n.is_read).length ?? 0),
    refetchInterval: 30000,
    retry: 1,
  });

  // ✅ useEffect MUST be before any conditional return
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  if (isAuthPage) return null;

  const title = PAGE_TITLES[location.pathname] || "CommerceOS";
  const hideSearch = location.pathname === "/settings";
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-5 flex-shrink-0 z-40">
      <h1 className="text-sm font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <button
          onClick={() => navigate("/admin/notifications")}
          className="relative p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-medium text-gray-200 leading-none">{user?.name || "User"}</span>
              <span className="text-[10px] text-gray-500 capitalize leading-none mt-0.5">{user?.role || "admin"}</span>
            </div>
            <ChevronDown size={13} className="text-gray-500 hidden md:block" />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate("/settings"); setDropOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <User size={13} /> Profile
                </button>
                <button
                  onClick={() => { navigate("/settings"); setDropOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Settings size={13} /> Settings
                </button>
              </div>
              <div className="border-t border-gray-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
