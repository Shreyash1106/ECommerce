import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingCart, Package, TrendingUp, LayoutDashboard, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const VENDOR_TABS = [
  { label: "Vendor Overview", icon: LayoutDashboard, to: "/vendor/dashboard" },
  { label: "My Products", icon: Package, to: "/vendor/products" },
  { label: "My Orders", icon: ShoppingCart, to: "/vendor/orders" },
  { label: "Analytics", icon: BarChart3, to: "/vendor/analytics" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md text-slate-900">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="text-blue-600 font-extrabold">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

export default function VendorAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["vendorAnalytics"],
    queryFn: () => client.get("/analytics/vendor").then((r) => r.data),
    retry: 1,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const monthly = (analytics?.revenue_data || []).map((d) => ({ month: d.month, revenue: d.revenue }));

  const avgOrder = analytics?.total_orders > 0
    ? (analytics.total_revenue / analytics.total_orders).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {VENDOR_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Vendor Sales Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Deep performance insights for your store</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue"    value={`$${Number(analytics?.total_revenue || 0).toLocaleString()}`} icon={DollarSign}  color="amber" trend={analytics?.revenue_trend >= 0 ? "up" : "down"} trendValue={Math.abs(analytics?.revenue_trend || 0)} />
          <StatCard title="Total Orders"     value={String(analytics?.total_orders   || 0)}                       icon={ShoppingCart} color="blue"   trend={analytics?.orders_trend  >= 0 ? "up" : "down"} trendValue={Math.abs(analytics?.orders_trend  || 0)} />
          <StatCard title="Products"         value={String(analytics?.total_products || 0)}                       icon={Package}      color="purple" trend="up" trendValue={0} />
          <StatCard title="Avg. Order Value" value={`$${avgOrder}`}                                               icon={TrendingUp}   color="green"  trend="up" trendValue={0} />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900">Monthly Revenue Trend</h3>
          </div>
          {monthly.length === 0 ? <EmptyState title="No revenue data yet" description="Revenue will appear once orders are placed." /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#vGrad)" name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
