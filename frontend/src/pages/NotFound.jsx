import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="text-center bg-white border border-slate-200/80 p-10 rounded-3xl shadow-sm max-w-md w-full">
        <h1 className="text-8xl font-black text-blue-600/20 mb-2">404</h1>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Page not found</h2>
        <p className="text-slate-500 text-xs mb-8">The page you're looking for doesn't exist or was moved.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary text-xs">
            <ArrowLeft size={14} /> Go back
          </button>
          <Link to="/home" className="btn-primary text-xs">
            <Home size={14} /> Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
