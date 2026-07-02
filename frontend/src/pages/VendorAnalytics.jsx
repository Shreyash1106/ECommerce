import React from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
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
    <div className="page-container">
      <div>
        <h1 className="text-lg font-semibold text-white">Analytics</h1>
        <p className="text-xs text-gray-500 mt-0.5">Your store performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"    value={`$${Number(analytics?.total_revenue || 0).toLocaleString()}`} icon={DollarSign}  color="indigo" trend={analytics?.revenue_trend >= 0 ? "up" : "down"} trendValue={Math.abs(analytics?.revenue_trend || 0)} />
        <StatCard title="Total Orders"     value={String(analytics?.total_orders   || 0)}                       icon={ShoppingCart} color="blue"   trend={analytics?.orders_trend  >= 0 ? "up" : "down"} trendValue={Math.abs(analytics?.orders_trend  || 0)} />
        <StatCard title="Products"         value={String(analytics?.total_products || 0)}                       icon={Package}      color="purple" trend="up" trendValue={0} />
        <StatCard title="Avg. Order Value" value={`$${avgOrder}`}                                               icon={TrendingUp}   color="green"  trend="up" trendValue={0} />
      </div>

      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Monthly Revenue</h3>
        </div>
        <div className="p-5">
          {monthly.length === 0 ? <EmptyState title="No revenue data yet" description="Revenue will appear once orders are placed." /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#vGrad)" name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
