import React, { useState } from "react";
import AdvancedRevenueChart from "../components/charts/AdvancedRevenueChart";
import RevenueTrendChart from "../components/charts/RevenueTrendChart";
import DailyOrdersChart from "../components/charts/DailyOrdersChart";
import CategoryRadarChart from "../components/charts/CategoryRadarChart";
import ProductScatterChart from "../components/charts/ProductScatterChart";
import OrderRevenueComposedChart from "../components/charts/OrderRevenueComposedChart";
import SalesFunnelChart from "../components/charts/SalesFunnelChart";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, Area, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const PERIODS = ["3M", "6M", "1Y"];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("1Y");

  const { data: dashboard, isLoading: l1 } = useQuery({
    queryKey: ["analyticsDashboard"],
    queryFn: () => client.get("/analytics/dashboard").then((r) => r.data),
    retry: 1,
  });

  const navigate = useNavigate();

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
          <h1 className="text-lg font-semibold text-white">Analytics Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Business performance overview with advanced insights</p>
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
        <StatCard title="Total Revenue"    value={`₹${Number(dashboard?.total_revenue || 0).toLocaleString()}`} icon={DollarSign}  color="indigo" trend={dashboard?.revenue_trend >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.revenue_trend || 0)} onClick={() => navigate('/admin/analytics')} />
        <StatCard title="Total Orders"     value={Number(dashboard?.total_orders   || 0).toLocaleString()}       icon={ShoppingCart} color="blue"   trend={dashboard?.orders_trend  >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.orders_trend  || 0)} onClick={() => navigate('/admin/orders')} />
        <StatCard title="Total Users"      value={Number(dashboard?.total_users    || 0).toLocaleString()}       icon={Users}        color="green"  trend={dashboard?.users_trend   >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.users_trend   || 0)} onClick={() => navigate('/admin/users')} />
        <StatCard title="Avg. Order Value" value={`₹${avgOrder.toFixed(2)}`}                                     icon={TrendingUp}   color="purple" trend="up" trendValue={0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={monthly} />
        </div>
        <SalesFunnelChart data={topProducts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {categories.length > 0 && <CategoryRadarChart data={categories} />}
        {topProducts.length > 0 && <ProductScatterChart data={topProducts} />}
      </div>

      <OrderRevenueComposedChart ordersData={dailyOrders} revenueData={monthly} />

      <DailyOrdersChart data={dailyOrders} />
    </div>
  );
}
