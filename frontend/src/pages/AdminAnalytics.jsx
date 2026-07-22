import React, { useState } from "react";
import AdvancedRevenueChart from "../components/charts/AdvancedRevenueChart";
import RevenueTrendChart from "../components/charts/RevenueTrendChart";
import DailyOrdersChart from "../components/charts/DailyOrdersChart";
import CategoryRadarChart from "../components/charts/CategoryRadarChart";
import ProductScatterChart from "../components/charts/ProductScatterChart";
import OrderRevenueComposedChart from "../components/charts/OrderRevenueComposedChart";
import SalesFunnelChart from "../components/charts/SalesFunnelChart";
import { TrendingUp, DollarSign, ShoppingCart, Users, LayoutDashboard, Package, BarChart3, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, NavLink } from "react-router-dom";
import client from "../api/client";
import StatCard from "../components/ui/StatCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

const PERIODS = ["3M", "6M", "1Y"];

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("1Y");
  const navigate = useNavigate();

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
  const categories = categoriesData?.categories || [];
  const topProducts = (topProductsData?.top_products || []).map((p) => ({ name: p.product_name, sales: p.total_orders }));

  const avgOrder = dashboard?.total_orders > 0
    ? (dashboard.total_revenue / dashboard.total_orders)
    : 0;

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {ADMIN_TABS.map((tab) => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Analytics Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive marketplace metrics & performance data</p>
          </div>
          <div className="flex border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${period === p ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue"    value={`$${Number(dashboard?.total_revenue || 0).toLocaleString()}`} icon={DollarSign}  color="amber" trend={dashboard?.revenue_trend >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.revenue_trend || 0)} onClick={() => navigate('/admin/analytics')} />
          <StatCard title="Total Orders"     value={Number(dashboard?.total_orders   || 0).toLocaleString()}       icon={ShoppingCart} color="blue"   trend={dashboard?.orders_trend  >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.orders_trend  || 0)} onClick={() => navigate('/admin/orders')} />
          <StatCard title="Total Users"      value={Number(dashboard?.total_users    || 0).toLocaleString()}       icon={Users}        color="green"  trend={dashboard?.users_trend   >= 0 ? "up" : "down"} trendValue={Math.abs(dashboard?.users_trend   || 0)} onClick={() => navigate('/admin/users')} />
          <StatCard title="Avg. Order Value" value={`$${avgOrder.toFixed(2)}`}                                     icon={TrendingUp}   color="purple" trend="up" trendValue={0} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueTrendChart data={monthly} />
          </div>
          <SalesFunnelChart data={topProducts} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {categories.length > 0 && <CategoryRadarChart data={categories} />}
          {topProducts.length > 0 && <ProductScatterChart data={topProducts} />}
        </div>

        <OrderRevenueComposedChart ordersData={dailyOrders} revenueData={monthly} />
        <DailyOrdersChart data={dailyOrders} />
      </div>
    </div>
  );
}
