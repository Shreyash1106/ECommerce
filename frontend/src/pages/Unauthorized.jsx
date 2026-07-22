import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX, Home, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGoHome = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "vendor") {
      navigate("/vendor/dashboard");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm">
        <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={40} className="text-rose-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-xs mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="btn-primary text-xs font-bold"
          >
            <Home size={16} />
            Go to Home
          </button>
          
          <button
            onClick={handleLogout}
            className="btn-danger text-xs font-bold"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
