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
import Unauthorized from "./pages/Unauthorized.jsx";

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
import SearchResults from "./pages/SearchResults.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CustomerHome from "./pages/CustomerHome.jsx";
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
    <div className="flex h-screen overflow-hidden bg-gray-950 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto relative z-0">
          {/* Subtle global top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/10 blur-[120px] pointer-events-none -z-10" />
          
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<RequireAuth allowedRoles={["admin"]}><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth allowedRoles={["admin"]}><AdminUsers /></RequireAuth>} />
            <Route path="/admin/products" element={<RequireAuth allowedRoles={["admin"]}><AdminProducts /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth allowedRoles={["admin"]}><AdminOrders /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth allowedRoles={["admin"]}><AdminAnalytics /></RequireAuth>} />
            <Route path="/admin/notifications" element={<RequireAuth allowedRoles={["admin"]}><AdminNotifications /></RequireAuth>} />

            {/* Vendor */}
            <Route path="/vendor/dashboard" element={<RequireAuth allowedRoles={["vendor"]}><VendorDashboard /></RequireAuth>} />
            <Route path="/vendor/products" element={<RequireAuth allowedRoles={["vendor"]}><VendorProducts /></RequireAuth>} />
            <Route path="/vendor/orders" element={<RequireAuth allowedRoles={["vendor"]}><VendorOrders /></RequireAuth>} />
            <Route path="/vendor/analytics" element={<RequireAuth allowedRoles={["vendor"]}><VendorAnalytics /></RequireAuth>} />

            {/* Customer */}
            <Route path="/home" element={<RequireAuth allowedRoles={["customer"]}><CustomerHome /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><ProfilePage /></RequireAuth>} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Unauthorized */}
            <Route path="/unauthorized" element={<Unauthorized />} />

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
  
  if (user.role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "customer") return <Navigate to="/home" replace />;
  
  return <Navigate to="/login" replace />;
}

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
