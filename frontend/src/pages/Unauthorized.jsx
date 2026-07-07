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
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX size={40} className="text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl px-6 py-3 transition-all"
          >
            <Home size={18} />
            Go to Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl px-6 py-3 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
