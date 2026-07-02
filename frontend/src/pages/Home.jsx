import React from "react";
import { Link } from "react-router-dom";
import { Zap, BarChart3, Package, ShoppingCart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5">
        <Zap size={26} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">CommerceOS</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        A modern, enterprise-grade e-commerce management platform for admins and vendors.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Link to="/admin/dashboard" className="btn-primary px-5 py-2.5">
          Admin Dashboard <ArrowRight size={14} />
        </Link>
        <Link to="/vendor/dashboard" className="btn-secondary px-5 py-2.5">
          Vendor Hub <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-sm">
        {[
          { icon: BarChart3, label: "Analytics" },
          { icon: Package, label: "Products" },
          { icon: ShoppingCart, label: "Orders" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="section-card flex flex-col items-center gap-2 py-4">
            <Icon size={18} className="text-indigo-400" />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
