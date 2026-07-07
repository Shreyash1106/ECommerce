import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { gradientDefs, gridStyle, axisTickStyle } from "../components/charts/ChartStyles";
import { CustomTooltip } from "../components/charts/CustomTooltip";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowUpRight, ExternalLink } from "lucide-react";

import { Link } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";



export default function VendorDashboard() {
  // Fetch vendor analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["vendorAnalytics"],
    queryFn: () => client.get("/analytics/vendor").then((r) => r.data),
    retry: false,
  });

  // Fetch vendor's orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["vendorOrders"],
    queryFn: () => client.get("/orders").then((r) => r.data),
    retry: false,
  });

  // Fetch vendor's products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["vendorProducts"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: false,
  });

  if (analyticsLoading || ordersLoading || productsLoading) return (
    <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  );

  const navigate = useNavigate();

  const recentOrders = (Array.isArray(ordersData) ? ordersData : []).slice(0, 4);
  const topProducts  = (Array.isArray(productsData) ? productsData : []).slice(0, 3);

  return (
    <div className="min-h-screen text-white pb-10">
      {/* Header */}
      <header className="px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Vendor Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your products and monitor sales performance</p>
      </header>

      {/* Stats */}
      <section className="px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`$${(analytics?.total_revenue || 0).toLocaleString()}`} 
            icon={DollarSign} 
            color="indigo" 
            trend="up" 
            trendValue={analytics?.revenue_trend ?? 0}
            onClick={() => navigate('/vendor/analytics')}
          />
          <StatCard 
            title="Total Orders" 
            value={analytics?.total_orders?.toString() || "0"} 
            icon={ShoppingCart} 
            color="blue" 
            trend="up" 
            trendValue={analytics?.orders_trend ?? 0}
            onClick={() => navigate('/vendor/orders')}
          />
          <StatCard 
            title="Products" 
            value={analytics?.total_products?.toString() || "0"} 
            icon={Package} 
            color="purple" 
            trend="up" 
            trendValue={analytics?.products_trend ?? 0}
            onClick={() => navigate('/vendor/products')}
          />
          <StatCard 
            title="New Customers" 
            value={analytics?.new_customers?.toString() || "0"} 
            icon={TrendingUp} 
            color="emerald" 
            trend="up" 
            trendValue={0}
          />
        </div>
      </section>

      {/* Charts */}
      <section className="px-8 pb-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Revenue Trend</h3>
                <p className="text-xs text-gray-400 mt-1">Your earnings over time</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight size={14} /> {analytics?.revenue_trend ?? 0}%
              </span>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics?.revenue_data || []}>
                  {gradientDefs('vendorGrad', '#6366f1', '#6366f1')}
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#vendorGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-base font-bold text-white tracking-tight">Top Products</h3>
              <Link to="/vendor/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20">Manage</Link>
            </div>
            <div className="divide-y divide-white/5 p-2">
              {topProducts.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500 text-center">No products yet</div>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0 shadow-inner">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                      <p className="text-xs font-medium text-indigo-400/80 mt-0.5">${p.price} price</p>
                    </div>
                    <p className="text-sm font-bold text-white">${Number(p.price).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="px-8">
        <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Orders</h3>
            <Link to="/vendor/orders" className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20">
              View all <ExternalLink size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-sm text-gray-500 text-center font-medium">No orders yet</td></tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-indigo-400 font-semibold">#{o.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-200">{o.customer || `User #${o.user_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[150px]">{o.product_name || `Product #${o.product_id}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-semibold">{o.quantity}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white text-right">${Number(o.total_price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center"><Badge status={(o.status || "pending").toLowerCase()}>{o.status || "Pending"}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
