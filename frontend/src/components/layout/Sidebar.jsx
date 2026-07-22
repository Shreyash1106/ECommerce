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
        relative flex flex-col bg-white border-r border-slate-200/80
        transition-all duration-300 ease-in-out flex-shrink-0 z-30 shadow-sm
        ${sidebarOpen ? "w-60" : "w-16"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${!sidebarOpen ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
          <Zap size={16} className="text-slate-950 font-bold" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">CommerceOS</span>
            <p className="text-[10px] font-bold text-amber-700 leading-none mt-0.5">{isAdmin ? "Admin Panel" : "Vendor Hub"}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-amber-500/10 text-amber-900 font-bold border border-amber-500/30 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold border border-transparent"
              } ${!sidebarOpen ? "justify-center" : ""}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings link */}
      <div className="p-3 border-t border-slate-100">
        <NavLink
          to="/profile"
          title={!sidebarOpen ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
              isActive 
                ? "bg-amber-500/10 text-amber-900 font-bold border border-amber-500/30 shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold border border-transparent"
            } ${!sidebarOpen ? "justify-center" : ""}`
          }
        >
          <Settings size={18} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-semibold">Settings</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full
          flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-md z-10 hover:scale-110"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
