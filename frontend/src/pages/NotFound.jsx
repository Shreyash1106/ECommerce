import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-indigo-600/30 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-8">The page you're looking for doesn't exist or was moved.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={14} /> Go back
          </button>
          <Link to="/admin/dashboard" className="btn-primary">
            <Home size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
