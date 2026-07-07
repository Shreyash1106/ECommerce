import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart3,
  Bell, Settings, Store, ShoppingCart, ChevronLeft, ChevronRight,
  Zap,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { useAuth } from "../../hooks/useAuth";

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
];

const vendorNav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/vendor/dashboard" },
  { label: "My Products", icon: Package, to: "/vendor/products" },
  { label: "My Orders", icon: ShoppingCart, to: "/vendor/orders" },
  { label: "Analytics", icon: BarChart3, to: "/vendor/analytics" },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  if (isAuthPage) return null;

  const navItems = user?.role === "vendor" ? vendorNav : adminNav;
  const isAdmin = user?.role !== "vendor";

  return (
    <aside
      className={`
        relative flex flex-col bg-gray-950/90 backdrop-blur-xl border-r border-white/5
        transition-all duration-300 ease-in-out flex-shrink-0
        ${sidebarOpen ? "w-60" : "w-16"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${!sidebarOpen ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <Zap size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">CommerceOS</span>
            <p className="text-[10px] font-medium text-indigo-400 leading-none mt-0.5">{isAdmin ? "Admin Panel" : "Vendor Hub"}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-indigo-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              } ${!sidebarOpen ? "justify-center" : ""}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings link */}
      <div className="p-3 border-t border-white/5">
        <NavLink
          to="/profile"
          title={!sidebarOpen ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive 
                ? "bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-indigo-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            } ${!sidebarOpen ? "justify-center" : ""}`
          }
        >
          <Settings size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-900 border border-gray-700 rounded-full
          flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all shadow-lg z-10 hover:scale-110"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
