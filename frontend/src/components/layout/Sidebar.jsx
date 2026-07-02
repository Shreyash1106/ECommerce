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
        relative flex flex-col bg-gray-900 border-r border-gray-800
        transition-all duration-300 ease-in-out flex-shrink-0
        ${sidebarOpen ? "w-60" : "w-16"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${!sidebarOpen ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <span className="text-sm font-bold text-white">CommerceOS</span>
            <p className="text-[10px] text-gray-500 leading-none">{isAdmin ? "Admin Panel" : "Vendor Hub"}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${!sidebarOpen ? "justify-center" : ""}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings link */}
      <div className="px-2 pb-4 border-t border-gray-800 pt-2">
        <NavLink
          to="/settings"
          title={!sidebarOpen ? "Settings" : undefined}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""} ${!sidebarOpen ? "justify-center" : ""}`
          }
        >
          <Settings size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full
          flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-10"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
