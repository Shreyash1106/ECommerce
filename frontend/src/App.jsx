import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

// Core Layout Components
import Navbar from "./components/layout/Navbar.jsx";
import MobileBottomNav from "./components/layout/MobileBottomNav.jsx";
import Footer from "./components/layout/Footer.jsx";

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
import AdminCmsPage from "./pages/AdminCmsPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage.jsx";

// Vendor pages
import VendorDashboard from "./pages/VendorDashboard.jsx";
import VendorProducts from "./pages/VendorProducts.jsx";
import VendorOrders from "./pages/VendorOrders.jsx";
import VendorAnalytics from "./pages/VendorAnalytics.jsx";
import VendorWalletPage from "./pages/VendorWalletPage.jsx";
import VendorProfilePage from "./pages/VendorProfilePage.jsx";
import VendorReviewsPage from "./pages/VendorReviewsPage.jsx";

// Marketplace & Customer pages
import CustomerHome from "./pages/CustomerHome.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import ReturnsPage from "./pages/ReturnsPage.jsx";
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-500/20 selection:text-blue-900">
      <div>
        <Navbar />
        <main className="flex-1 pb-12">
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Marketplace Customer Pages */}
            <Route path="/home" element={<CustomerHome />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><CheckoutPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><ProfilePage /></RequireAuth>} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><OrderHistoryPage /></RequireAuth>} />
            <Route path="/order-success" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><OrderSuccessPage /></RequireAuth>} />
            <Route path="/returns" element={<RequireAuth allowedRoles={["customer", "vendor", "admin"]}><ReturnsPage /></RequireAuth>} />

            {/* Admin Hub */}
            <Route path="/admin/dashboard" element={<RequireAuth allowedRoles={["admin"]}><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth allowedRoles={["admin"]}><AdminUsers /></RequireAuth>} />
            <Route path="/admin/products" element={<RequireAuth allowedRoles={["admin"]}><AdminProducts /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth allowedRoles={["admin"]}><AdminOrders /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth allowedRoles={["admin"]}><AdminAnalytics /></RequireAuth>} />
            <Route path="/admin/notifications" element={<RequireAuth allowedRoles={["admin"]}><AdminNotifications /></RequireAuth>} />
            <Route path="/admin/cms" element={<RequireAuth allowedRoles={["admin"]}><AdminCmsPage /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth allowedRoles={["admin"]}><AdminSettingsPage /></RequireAuth>} />
            <Route path="/admin/audit-logs" element={<RequireAuth allowedRoles={["admin"]}><AdminAuditLogsPage /></RequireAuth>} />

            {/* Vendor Hub */}
            <Route path="/vendor/dashboard" element={<RequireAuth allowedRoles={["vendor"]}><VendorDashboard /></RequireAuth>} />
            <Route path="/vendor/products" element={<RequireAuth allowedRoles={["vendor"]}><VendorProducts /></RequireAuth>} />
            <Route path="/vendor/orders" element={<RequireAuth allowedRoles={["vendor"]}><VendorOrders /></RequireAuth>} />
            <Route path="/vendor/analytics" element={<RequireAuth allowedRoles={["vendor"]}><VendorAnalytics /></RequireAuth>} />
            <Route path="/vendor/wallet" element={<RequireAuth allowedRoles={["vendor"]}><VendorWalletPage /></RequireAuth>} />
            <Route path="/vendor/profile" element={<RequireAuth allowedRoles={["vendor"]}><VendorProfilePage /></RequireAuth>} />
            <Route path="/vendor/reviews" element={<RequireAuth allowedRoles={["vendor"]}><VendorReviewsPage /></RequireAuth>} />

            {/* System */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/home" replace />;
  
  if (user.role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/home" replace />;
}

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
