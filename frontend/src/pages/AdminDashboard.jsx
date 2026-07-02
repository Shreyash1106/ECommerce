import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, ExternalLink } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
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

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError || !data) return (
    <div className="page-container">
      <EmptyState title="Could not load dashboard" description="Backend is offline or returned an error." />
    </div>
  );

  const revenueData = data.revenue_data || [];
  const recentOrders = data.recent_orders || [];
  const topProducts = data.top_products || [];

  const stats = [
    { title: "Total Revenue",  value: `$${Number(data.total_revenue  || 0).toLocaleString()}`, icon: DollarSign,  color: "indigo", trend: data.revenue_trend  >= 0 ? "up" : "down", trendValue: Math.abs(data.revenue_trend  || 0) },
    { title: "Total Orders",   value: Number(data.total_orders   || 0).toLocaleString(),        icon: ShoppingCart, color: "blue",   trend: data.orders_trend   >= 0 ? "up" : "down", trendValue: Math.abs(data.orders_trend   || 0) },
    { title: "Total Products", value: Number(data.total_products || 0).toLocaleString(),        icon: Package,      color: "purple", trend: data.products_trend >= 0 ? "up" : "down", trendValue: Math.abs(data.products_trend || 0) },
    { title: "Total Users",    value: Number(data.total_users    || 0).toLocaleString(),        icon: Users,        color: "green",  trend: data.users_trend    >= 0 ? "up" : "down", trendValue: Math.abs(data.users_trend    || 0) },
  ];

  return (
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.title} {...s} onClick={() => {
          // navigate to relevant admin page based on title
          // Titles: Total Revenue -> /admin/analytics, Total Orders -> /admin/orders, Total Products -> /admin/products, Total Users -> /admin/users
          const map = {
            "Total Revenue": "/admin/analytics",
            "Total Orders": "/admin/orders",
            "Total Products": "/admin/products",
            "Total Users": "/admin/users",
          };
          const to = map[s.title];
          if (to) navigate(to);
        }} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
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
          <div className="p-5">
            {revenueData.length === 0 ? (
              <EmptyState title="No revenue data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Orders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Monthly order count</p>
          </div>
          <div className="p-5">
            {revenueData.length === 0 ? (
              <EmptyState title="No order data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Recent Orders</h3>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all <ExternalLink size={11} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th>Order</th><th>Customer</th><th>Product</th><th>Date</th><th>Amount</th><th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-indigo-400 font-semibold">#{o.id}</td>
                    <td className="text-gray-200">{o.customer || `User #${o.user_id}`}</td>
                    <td className="text-gray-500 text-xs">{o.product_name || `Product #${o.product_id}`}</td>
                    <td className="text-gray-500 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                    <td className="font-semibold text-white">${Number(o.total_price || 0).toFixed(2)}</td>
                    <td><Badge status={(o.status || "pending").toLowerCase()}>{o.status || "Pending"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
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
                  <p className="text-xs font-semibold text-white">${Number(p.revenue || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
