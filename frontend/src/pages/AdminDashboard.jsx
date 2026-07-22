import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Package, Users, ExternalLink, LayoutDashboard, BarChart3, Bell, Image, Settings, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { CustomTooltip } from "../components/charts/CustomTooltip";
import { Link, useNavigate, NavLink } from "react-router-dom";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
  { label: "CMS Banners", icon: Image, to: "/admin/cms" },
  { label: "Site Settings", icon: Settings, to: "/admin/settings" },
  { label: "Audit Logs", icon: FileText, to: "/admin/audit-logs" },
];

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => client.get("/analytics/dashboard").then((r) => r.data),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (isError)
    return (
      <div className="page-container">
        <EmptyState
          icon={LayoutDashboard}
          title="Could not load Dashboard"
          description="Failed to retrieve analytics from backend."
        />
      </div>
    );

  const stats          = data?.stats          ?? {};
  const salesOverTime  = data?.sales_over_time  ?? [];
  const topProducts    = data?.top_products    ?? [];
  const recentOrders   = data?.recent_orders   ?? [];

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Control Hub</h1>
            <p className="text-slate-500 text-xs mt-1">Real-time marketplace operations & platform overview</p>
          </div>
          <button
            onClick={() => navigate("/admin/analytics")}
            className="btn-primary text-xs font-bold flex items-center gap-1.5"
          >
            Full Report <ExternalLink size={14} />
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`$${(stats.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="up"
            trendValue={12.4}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={(stats.total_orders ?? 0).toLocaleString()}
            trend="up"
            trendValue={8.1}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={(stats.total_products ?? 0).toLocaleString()}
            trend="up"
            trendValue={3.5}
            icon={Package}
            color="amber"
          />
          <StatCard
            title="Total Users"
            value={(stats.total_users ?? 0).toLocaleString()}
            trend="up"
            trendValue={5.2}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Revenue Performance</h3>
                <p className="text-xs text-slate-500">Gross monthly order volume ($)</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                +12.4% vs last period
              </span>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Bar Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Top Selling Products</h3>
              <p className="text-xs text-slate-500">Highest grossing items in catalog</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Marketplace Orders</h3>
              <p className="text-xs text-slate-500">Live order activity feed across all vendors</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-bold text-blue-600 font-mono">#{o.id}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">{o.user?.username || `User #${o.user_id}`}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{o.product_name || `Product #${o.product_id}`}</td>
                    <td className="px-4 py-3.5 text-xs font-black text-slate-900 text-right">${Number(o.total_price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge status={(o.status || 'Pending').toLowerCase()}>{o.status || 'Pending'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
