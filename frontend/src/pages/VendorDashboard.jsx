import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-md text-slate-900">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="text-amber-700 font-extrabold">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

export default function VendorDashboard() {
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["vendorAnalytics"],
    queryFn: () => client.get("/analytics/vendor").then((r) => r.data),
    retry: false,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["vendorOrders"],
    queryFn: () => client.get("/orders").then((r) => r.data),
    retry: false,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["vendorProducts"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: false,
  });

  if (analyticsLoading || ordersLoading || productsLoading) return (
    <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  );

  if (!analytics) return (
    <div className="min-h-screen text-slate-900 pb-10 px-8 py-8 bg-slate-50">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 font-semibold text-sm">
        <p>Failed to load analytics data. Please refresh the page.</p>
      </div>
    </div>
  );

  const recentOrders = (Array.isArray(ordersData) ? ordersData : []).slice(0, 4);
  const topProducts  = (Array.isArray(productsData) ? productsData : []).slice(0, 3);

  const stats = [
    { title: "Total Sales", value: `$${(analytics.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: "amber", trend: "up", trendValue: analytics.revenue_trend || 0 },
    { title: "Orders", value: analytics.total_orders || 0, icon: ShoppingCart, color: "blue", trend: "up", trendValue: analytics.orders_trend || 0 },
    { title: "My Products", value: analytics.total_products || 0, icon: Package, color: "purple", trend: "up", trendValue: analytics.products_trend || 0 },
  ];

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50">
      <div className="space-y-8 py-6">
        {/* Header */}
        <div className="px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vendor Hub</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your store products, orders, and daily performance</p>
          </div>
          <button onClick={() => navigate("/vendor/products")} className="btn-primary">
            + Add New Product
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-8">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Sales Chart */}
        <section className="px-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sales Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly revenue breakdown for your products</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analytics.revenue_data || []}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<TooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#vGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Orders & Top Products */}
        <div className="grid lg:grid-cols-3 gap-6 px-8">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <Link to="/vendor/orders" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                View All <ExternalLink size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Order</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-indigo-600">#{o.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{o.customer || `User #${o.user_id}`}</td>
                      <td className="px-6 py-4 text-sm font-extrabold text-slate-900 text-right">${Number(o.total_price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center"><Badge status={(o.status || "pending").toLowerCase()}>{o.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Top Performing Products</h3>
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="w-8 h-8 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-lg flex items-center justify-center">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
