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
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </header>

        {/* Cards Section */}
        <section className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <section className="p-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 section-card">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200">Revenue Overview</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Monthly revenue</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <ArrowUpRight size={13} /> {data.revenue_trend || 0}%
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
            <div className="section-card">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-200">Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">Monthly order count</p>
              </div>
              <div className="p-5">
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
                        radius={[3, 3, 0, 0]}
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

        {/* Recent Orders Section */}
        <section className="p-6">
          <div className="section-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-200">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all <ExternalLink size={11} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" />
            ) : (
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-mono text-indigo-400 font-semibold">#{o.id}</td>
                      <td className="text-gray-200">{o.customer || `User #${o.user_id}`}</td>
                      <td className="text-gray-500 text-xs">{o.product_name || `Product #${o.product_id}`}</td>
                      <td className="text-gray-500 text-xs">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="font-semibold text-white">
                        ${Number(o.total_price || 0).toFixed(2)}
                      </td>
                      <td>
                        <Badge status={(o.status || "pending").toLowerCase()}>{o.status || "Pending"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Users (Top Products) Section */}
        <section className="p-6">
          <div className="section-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-200">Top Products</h3>
              <Link
                to="/admin/products"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <EmptyState title="No products yet" />
            ) : (
              <div className="divide-y divide-gray-800">
                {topProducts.map((p, i) => (
                  <div key={p.name || i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.sales || 0} sold</p>
                    </div>
                    <p className="text-xs font-semibold text-white">{Number(p.revenue || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
