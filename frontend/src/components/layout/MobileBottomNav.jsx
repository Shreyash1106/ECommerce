import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Layers, Search, ShoppingCart, Package, User } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useAuth } from "../../hooks/useAuth";

export default function MobileBottomNav() {
  const { cart = [] } = useStore();
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  if (isAuthPage) return null;

  const totalCartItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const homePath = user?.role === "admin" ? "/admin/dashboard" : user?.role === "vendor" ? "/vendor/dashboard" : "/home";

  const navItems = [
    { label: "Home", icon: Home, to: homePath },
    { label: "Search", icon: Search, to: "/search" },
    { label: "Cart", icon: ShoppingCart, to: "/cart", badge: totalCartItems },
    { label: "Orders", icon: Package, to: "/profile" },
    { label: "Profile", icon: User, to: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-lg px-2 py-2 flex items-center justify-around font-sans">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={idx}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 relative ${
              isActive ? "text-blue-600 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
