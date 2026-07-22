import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Settings, Building2, Mail, Phone, DollarSign, Percent, ShieldCheck,
  FileText, Save, LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Bell, Image
} from "lucide-react";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
  { label: "CMS Banners", icon: Image, to: "/admin/cms" },
  { label: "Site Settings", icon: Settings, to: "/admin/settings" },
  { label: "Audit Logs", icon: FileText, to: "/admin/audit-logs" },
];

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    company_name: "CommerceOS Marketplace Inc.",
    support_email: "support@commerceos.com",
    support_phone: "+1 (800) 555-0199",
    gst_number: "27AAAAA0000A1Z5",
    currency: "USD ($)",
    tax_percentage: "18.0",
    free_shipping_threshold: "100.00",
    standard_shipping_fee: "15.00",
  });

  const [activePolicyTab, setActivePolicyTab] = useState("about"); // 'about' | 'privacy' | 'terms' | 'refund'
  const [policyText, setPolicyText] = useState({
    about: "CommerceOS is a premier multi-vendor e-commerce marketplace platform built for scale, reliability, and speed.",
    privacy: "We value your privacy. All user personal information and payment metadata are protected with 256-bit SSL encryption.",
    terms: "By accessing CommerceOS Marketplace, vendors and customers agree to operate in accordance with verified merchant terms.",
    refund: "Customers may request a full credit refund for eligible delivered orders within 30 days of shipment receipt.",
  });

  const [loading, setLoading] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Site configuration & CMS policies saved!");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
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
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      <div className="max-w-4xl mx-auto space-y-8 px-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marketplace Site Configuration</h1>
          <p className="text-slate-500 text-xs mt-1">Configure global marketplace variables, tax rates, shipping rules, and rich policy pages.</p>
        </div>

        {/* Global Settings Form */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
          <form onSubmit={handleSaveConfig} className="space-y-6 text-xs">
            
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Marketplace Company & Support Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">GST Registration Number</label>
                  <input
                    type="text"
                    value={config.gst_number}
                    onChange={(e) => setConfig({ ...config, gst_number: e.target.value })}
                    className="input-field font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Support Email *</label>
                  <input
                    type="email"
                    value={config.support_email}
                    onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Support Phone *</label>
                  <input
                    type="text"
                    value={config.support_phone}
                    onChange={(e) => setConfig({ ...config, support_phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Financial, Tax & Shipping Rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Default Currency</label>
                  <input
                    type="text"
                    value={config.currency}
                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">GST Tax Percentage (%)</label>
                  <input
                    type="text"
                    value={config.tax_percentage}
                    onChange={(e) => setConfig({ ...config, tax_percentage: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Free Shipping Threshold ($)</label>
                  <input
                    type="text"
                    value={config.free_shipping_threshold}
                    onChange={(e) => setConfig({ ...config, free_shipping_threshold: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Policy Pages Rich Text CMS */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">CMS Legal Policy Pages Editor</h3>
              
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                {[
                  { id: "about", label: "About Us" },
                  { id: "privacy", label: "Privacy Policy" },
                  { id: "terms", label: "Terms & Conditions" },
                  { id: "refund", label: "Refund Policy" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePolicyTab(p.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      activePolicyTab === p.id ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={policyText[activePolicyTab]}
                onChange={(e) => setPolicyText({ ...policyText, [activePolicyTab]: e.target.value })}
                className="input-field resize-none leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" loading={loading} icon={Save} className="text-xs font-bold">
                Save Site Configuration
              </Button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
