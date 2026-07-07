import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ExternalLink } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { gradientDefs, gridStyle, axisTickStyle } from "../components/charts/ChartStyles";
import { CustomTooltip } from "../components/charts/CustomTooltip";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { ChartWrapper } from "../components/charts/ChartWrapper";
import EmptyState from "../components/ui/EmptyState";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

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

  if (isError || !data)
    return (
      <div className="page-container">
        <EmptyState
          title="Could not load dashboard"
          description="Backend is offline or returned an error."
        />
      </div>
    );

  const revenueData = data.revenue_data || [];
  const recentOrders = data.recent_orders || [];
  const topProducts = data.top_products || [];

  const stats = [
    {
      title: "Total Revenue",
      value: `$${Number(data.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "indigo",
      trend: data.revenue_trend >= 0 ? "up" : "down",
      trendValue: Math.abs(data.revenue_trend || 0),
    },
    {
      title: "Total Orders",
      value: Number(data.total_orders || 0).toLocaleString(),
      icon: ShoppingCart,
      color: "teal",
      trend: data.orders_trend >= 0 ? "up" : "down",
      trendValue: Math.abs(data.orders_trend || 0),
    },
    {
      title: "Total Products",
      value: Number(data.total_products || 0).toLocaleString(),
      icon: Package,
      color: "amber",
      trend: data.products_trend >= 0 ? "up" : "down",
      trendValue: Math.abs(data.products_trend || 0),
    },
    {
      title: "Total Users",
      value: Number(data.total_users || 0).toLocaleString(),
      icon: Users,
      color: "emerald",
      trend: data.users_trend >= 0 ? "up" : "down",
      trendValue: Math.abs(data.users_trend || 0),
    },
  ];

  return (
    <>
      <div className="min-h-screen text-white pb-10">
        {/* Header */}
        <header className="px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your store's performance</p>
        </header>

        {/* Cards Section */}
        <section className="px-8 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <StatCard
                key={s.title}
                {...s}
                onClick={() => {
                  const map = {
                    "Total Revenue": "/admin/analytics",
                    "Total Orders": "/admin/orders",
                    "Total Products": "/admin/products",
                    "Total Users": "/admin/users",
                  };
                  const to = map[s.title];
                  if (to) navigate(to);
                }}
              />
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <section className="px-8 pb-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Revenue Overview</h3>
                  <p className="text-xs text-gray-400 mt-1">Monthly revenue</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <ArrowUpRight size={14} /> {data.revenue_trend || 0}%
                </span>
              </div>
              <ChartWrapper
                type="area"
                title="Revenue Overview"
                data={revenueData}
                gradientId="revGrad"
              />
            </div>

            {/* Orders Bar Chart */}
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-base font-bold text-white tracking-tight">Orders</h3>
                <p className="text-xs text-gray-400 mt-1">Monthly order count</p>
              </div>
              <div className="p-6">
                {(data.monthly_orders?.length ?? 0) === 0 ? (
                  <EmptyState title="No order data yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    {gradientDefs('orderGrad', '#14b8a6', '#14b8a6')}
                    <BarChart data={data.monthly_orders.slice(-6)}>
                      <CartesianGrid {...gridStyle} />
                      <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="orders"
                        fill="url(#orderGrad)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6 px-8">
          {/* Recent Orders Section */}
          <section className="lg:col-span-2">
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-base font-bold text-white tracking-tight">Recent Orders</h3>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20"
                >
                  View all <ExternalLink size={12} />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <EmptyState title="No orders yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-mono text-sm text-indigo-400 font-semibold">#{o.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-200">{o.customer || `User #${o.user_id}`}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[150px]">{o.product_name || `Product #${o.product_id}`}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white text-right">
                            ${Number(o.total_price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge status={(o.status || "pending").toLowerCase()}>{o.status || "Pending"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Top Products Section */}
          <section>
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-base font-bold text-white tracking-tight">Top Products</h3>
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20"
                >
                  View all
                </Link>
              </div>
              {topProducts.length === 0 ? (
                <EmptyState title="No products yet" />
              ) : (
                <div className="divide-y divide-white/5 p-2">
                  {topProducts.map((p, i) => (
                    <div key={p.name || i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0 shadow-inner">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                        <p className="text-xs font-medium text-indigo-400/80 mt-0.5">{p.sales || 0} units sold</p>
                      </div>
                      <p className="text-sm font-bold text-white">${Number(p.revenue || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
