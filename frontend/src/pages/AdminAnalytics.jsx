import React, { useState } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const PERIODS = ["3M", "6M", "1Y"];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-bold">{p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("1Y");

  const { data: dashboard, isLoading: l1 } = useQuery({
    queryKey: ["analyticsDashboard"],
    queryFn: () => client.get("/analytics/dashboard").then((r) => r.data),
    retry: 1,
  });

  const { data: revenueData, isLoading: l2 } = useQuery({
    queryKey: ["analyticsRevenue"],
    queryFn: () => client.get("/analytics/revenue").then((r) => r.data),
    retry: 1,
  });

  const { data: ordersData, isLoading: l3 } = useQuery({
    queryKey: ["analyticsOrders"],
    queryFn: () => client.get("/analytics/orders").then((r) => r.data),
    retry: 1,
  });

  const { data: customersData, isLoading: l4 } = useQuery({
    queryKey: ["analyticsCustomers"],
    queryFn: () => client.get("/analytics/customers").then((r) => r.data),
    retry: 1,
  });

  const { data: categoriesData, isLoading: l5 } = useQuery({
    queryKey: ["analyticsCategories"],
    queryFn: () => client.get("/analytics/categories").then((r) => r.data),
    retry: 1,
  });

  const { data: topProductsData, isLoading: l6 } = useQuery({
    queryKey: ["analyticsTopProducts"],
    queryFn: () => client.get("/analytics/top-products").then((r) => r.data),
    retry: 1,
  });

  if (l1 || l2 || l3 || l4 || l5 || l6) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  const sliceMap = { "3M": 3, "6M": 6, "1Y": 12 };
  const monthly = (revenueData?.monthly_sales || []).slice(-sliceMap[period]);
  const dailyOrders = (ordersData?.daily_orders || []).map((d) => ({ date: d.date, orders: d.orders }));
  const dailyCustomers = (customersData?.daily_new_customers || []).map((d) => ({ date: d.date, customers: d.new_customers }));
  const categories = categoriesData?.categories || [];
  const topProducts = (topProductsData?.top_products || []).map((p) => ({ name: p.product_name, sales: p.total_orders }));

  const avgOrder = dashboard?.total_orders > 0
    ? (dashboard.total_revenue / dashboard.total_orders)
    : 0;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Business performance overview</p>
        </div>
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"    value={`$${Number(dashboard?.total_revenue || 0).toLocaleString()}`} icon={DollarSign}  color="indigo" trend={dashboard?.revenue_trend >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.revenue_trend || 0)} />
        <StatCard title="Total Orders"     value={Number(dashboard?.total_orders   || 0).toLocaleString()}       icon={ShoppingCart} color="blue"   trend={dashboard?.orders_trend  >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.orders_trend  || 0)} />
        <StatCard title="Total Users"      value={Number(dashboard?.total_users    || 0).toLocaleString()}       icon={Users}        color="green"  trend={dashboard?.users_trend   >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.users_trend   || 0)} />
        <StatCard title="Avg. Order Value" value={`$${avgOrder.toFixed(2)}`}                                     icon={TrendingUp}   color="purple" trend="up" trendValue={0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 section-card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Revenue Trend</h3>
          </div>
          <div className="p-5">
            {monthly.length === 0 ? <EmptyState title="No revenue data yet" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#g1)" name="revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Sales by Category</h3>
          </div>
          <div className="p-5">
            {categories.length === 0 ? <EmptyState title="No category data yet" /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {categories.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `$${v}`} contentStyle={{ background: "#1a1a24", border: "1px solid #252534", borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categories.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-gray-400">{c.name}</span>
                      </div>
                      <span className="text-gray-200 font-medium">${Number(c.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="section-card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Top Product Performance</h3>
          </div>
          <div className="p-5">
            {topProducts.length === 0 ? <EmptyState title="No product data yet" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9494a8" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} name="sales" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">New Customers (Daily)</h3>
          </div>
          <div className="p-5">
            {dailyCustomers.length === 0 ? <EmptyState title="No customer data yet" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyCustomers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 3 }} name="customers" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Daily Orders (Last 30 Days)</h3>
        </div>
        <div className="p-5">
          {dailyOrders.length === 0 ? <EmptyState title="No order data yet" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} name="orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
