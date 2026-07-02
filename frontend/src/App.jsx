import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

// Layout
import Sidebar from "./components/layout/Sidebar.jsx";
import Header from "./components/layout/Header.jsx";

// Auth pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import AdminNotifications from "./pages/AdminNotifications.jsx";

// Vendor pages
import VendorDashboard from "./pages/VendorDashboard.jsx";
import VendorProducts from "./pages/VendorProducts.jsx";
import VendorOrders from "./pages/VendorOrders.jsx";
import VendorAnalytics from "./pages/VendorAnalytics.jsx";

// Other pages
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

function AppLayout() {
  const location = useLocation();
  const isAuth = AUTH_ROUTES.includes(location.pathname);

  if (isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
            <Route path="/admin/products" element={<RequireAuth><AdminProducts /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth><AdminOrders /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
            <Route path="/admin/notifications" element={<RequireAuth><AdminNotifications /></RequireAuth>} />

            {/* Vendor */}
            <Route path="/vendor/dashboard" element={<RequireAuth><VendorDashboard /></RequireAuth>} />
            <Route path="/vendor/products" element={<RequireAuth><VendorProducts /></RequireAuth>} />
            <Route path="/vendor/orders" element={<RequireAuth><VendorOrders /></RequireAuth>} />
            <Route path="/vendor/analytics" element={<RequireAuth><VendorAnalytics /></RequireAuth>} />

            {/* Shared */}
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />

            {/* Catch auth routes inside main layout (redirect) */}
            <Route path="/login" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/admin/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "vendor" ? "/vendor/dashboard" : "/admin/dashboard"} replace />;
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
