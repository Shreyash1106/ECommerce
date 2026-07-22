import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Store, ShieldCheck, CheckCircle2, AlertTriangle, Building2,
  Mail, Phone, FileText, MapPin, Clock, Save, LayoutDashboard,
  Package, ShoppingCart, BarChart3, Wallet, Star
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const VENDOR_TABS = [
  { label: "Vendor Overview", icon: LayoutDashboard, to: "/vendor/dashboard" },
  { label: "My Products", icon: Package, to: "/vendor/products" },
  { label: "My Orders", icon: ShoppingCart, to: "/vendor/orders" },
  { label: "Sales Analytics", icon: BarChart3, to: "/vendor/analytics" },
  { label: "Wallet & Payouts", icon: Wallet, to: "/vendor/wallet" },
  { label: "Store Profile", icon: Store, to: "/vendor/profile" },
  { label: "Customer Reviews", icon: Star, to: "/vendor/reviews" },
];

export default function VendorProfilePage() {
  const [shopForm, setShopForm] = useState({
    shop_name: "Apex Electronics & Gear",
    description: "Official authorized dealer for high-grade audio gear, gadgets, and smartwatch accessories.",
    contact_email: "support@apexelectronics.com",
    contact_phone: "+1 (555) 392-8401",
    gst_number: "27AAAAA0000A1Z5",
    pan_number: "ABCDE1234F",
    business_address: "104 Tech Boulevard, Suite 400, San Francisco, CA 94107",
    working_hours: "Mon - Sat: 9:00 AM - 7:00 PM EST",
    verification_status: "Approved",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Merchant Shop Profile updated successfully!");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      {/* Horizontal Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {VENDOR_TABS.map((tab) => {
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

      <div className="max-w-4xl mx-auto space-y-6 px-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Merchant Shop Profile</h1>
            <p className="text-slate-500 text-xs mt-1">Manage public storefront branding, legal GST/PAN records, and business contact info.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Status: Approved</span>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* Branding Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Store Branding & Overview</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Official Store Name *</label>
                  <input
                    type="text"
                    value={shopForm.shop_name}
                    onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Store Description *</label>
                  <textarea
                    rows={3}
                    value={shopForm.description}
                    onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                    className="input-field resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Legal & Registration */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Tax & Legal Registration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">GST Registration Number</label>
                  <input
                    type="text"
                    value={shopForm.gst_number}
                    onChange={(e) => setShopForm({ ...shopForm, gst_number: e.target.value })}
                    className="input-field font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={shopForm.pan_number}
                    onChange={(e) => setShopForm({ ...shopForm, pan_number: e.target.value })}
                    className="input-field font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Business Info */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Contact & Business Operations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={shopForm.contact_email}
                    onChange={(e) => setShopForm({ ...shopForm, contact_email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={shopForm.contact_phone}
                    onChange={(e) => setShopForm({ ...shopForm, contact_phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Business Address *</label>
                  <input
                    type="text"
                    value={shopForm.business_address}
                    onChange={(e) => setShopForm({ ...shopForm, business_address: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" loading={loading} icon={Save} className="text-xs font-bold">
                Save Shop Profile
              </Button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
