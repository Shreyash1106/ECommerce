import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag, Search, ShoppingCart, Heart, Bell, User,
  ChevronDown, LogOut, Package, MapPin, LayoutDashboard,
  Menu, X, Sparkles, Tag, ShieldCheck, Flame, Compass
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { useStore } from "../../store/useStore";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";

const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Home & Garden" },
  { id: 5, name: "Sports" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart = [], unreadCount, setUnreadCount } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const dropdownRef = useRef(null);

  // Auto search on debounced query change when user is typing in search bar
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2 && location.pathname.startsWith("/search")) {
      const catParam = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      navigate(`/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}${catParam}`, { replace: true });
    }
  }, [debouncedSearchQuery, selectedCategory]);

  // Sync unread notifications
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => client.get("/notifications").then((r) => r.data),
    onSuccess: (data) => setUnreadCount(data?.unread_count ?? data?.notifications?.filter((n) => !n.is_read).length ?? 0),
    refetchInterval: 30000,
    retry: 1,
    enabled: !!user,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  if (isAuthPage) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const catParam = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      navigate(`/search?q=${encodeURIComponent(searchQuery)}${catParam}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const totalCartItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username : "Guest";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm font-sans">
      
      {/* Upper Announcement Bar */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] uppercase">Flash Sale</span>
            <span>Up to 40% OFF on Top Tech & Autumn Apparel Collection!</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Authentic Products</span>
            <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-blue-400" /> Express 24-hr Shipping</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none block">
                Commerce<span className="text-blue-600">OS</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 block mt-0.5">
                Enterprise Marketplace
              </span>
            </div>
          </Link>

          {/* Central Mega Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white border border-slate-200 focus-within:border-blue-600 rounded-2xl overflow-hidden shadow-inner transition-all">
              
              {/* Category Dropdown */}
              <div className="relative border-r border-slate-200/80 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className="px-3.5 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-200/60 transition-colors h-full"
                >
                  <span className="truncate max-w-[100px]">{selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {catDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory("All"); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold ${selectedCategory === "All" ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      All Departments
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => { setSelectedCategory(c.name); setCatDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold ${selectedCategory === c.name ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />

              {/* Submit button */}
              <button
                type="submit"
                className="px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-3" ref={dropdownRef}>
            
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all duration-150 relative hidden sm:flex items-center justify-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate(user?.role === "admin" ? "/admin/notifications" : "/profile")}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-2xl transition-all duration-150 relative flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-2xl text-blue-600 font-extrabold text-sm transition-all shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">Cart</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200/80 shadow-sm"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-900 leading-none">{displayName}</span>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize mt-1 leading-none">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    {user.role === "vendor" && (
                      <Link
                        to="/vendor/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Vendor Hub
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders & Tracking
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Account Settings
                    </Link>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-extrabold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
