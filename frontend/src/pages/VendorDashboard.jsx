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
    <div className="page-container">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          color="green" 
          trend="up" 
          trendValue={0}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-200">Revenue Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Your earnings over time</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-400"><ArrowUpRight size={13} /> {analytics?.revenue_trend ?? 0}%</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics?.revenue_data || []}>
                {gradientDefs('vendorGrad', '#6366f1', '#6366f1')}
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a24" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b6b84" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#vendorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-200">Top Products</h3>
            <Link to="/vendor/products" className="text-xs text-indigo-400 hover:text-indigo-300">Manage</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {topProducts.length === 0 ? (
              <div className="px-5 py-4 text-xs text-gray-500">No products yet</div>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-500">${p.price} price</p>
                  </div>
                  <p className="text-xs font-semibold text-white">${(p.price).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="section-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Recent Orders</h3>
          <Link to="/vendor/orders" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
            View all <ExternalLink size={11} />
          </Link>
        </div>
        <table className="data-table w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {recentOrders.length === 0 ? (
              <tr><td colSpan="6" className="px-5 py-4 text-xs text-gray-500 text-center">No orders yet</td></tr>
            ) : (
              recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-indigo-400">#{o.id}</td>
                  <td className="font-medium text-gray-200">{o.customer || `User #${o.user_id}`}</td>
                  <td className="text-gray-300 text-xs">{o.product_name || `Product #${o.product_id}`}</td>
                  <td className="text-gray-500">{o.quantity}</td>
                  <td className="font-semibold text-white">${Number(o.total_price).toFixed(2)}</td>
                  <td><Badge status={(o.status || "pending").toLowerCase()}>{o.status || "Pending"}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
