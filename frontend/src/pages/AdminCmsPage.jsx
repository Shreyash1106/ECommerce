import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Bell,
  Image, Layers, Tag, Mail, Plus, Pencil, Trash2, CheckCircle2,
  Calendar, Eye, ShieldCheck, Settings, FileText, Sparkles
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
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

const INITIAL_BANNERS = [
  { id: 1, title: "Summer Electronics Festival", subtitle: "Up to 40% OFF on Top Laptops & Audio", badge: "Limited Time", status: "Active", priority: 1, publish_date: "2026-07-01", expiry_date: "2026-08-01" },
  { id: 2, title: "Autumn Fashion Collection", subtitle: "Discover Trending Apparel & Designer Accessories", badge: "New Arrivals", status: "Active", priority: 2, publish_date: "2026-07-15", expiry_date: "2026-09-01" },
];

const INITIAL_BRANDS = [
  { id: 1, name: "Sony", logo: "💻", description: "Official audio & camera equipment", featured: true },
  { id: 2, name: "Apple", logo: "🍎", description: "Premium smartphones, watches & laptops", featured: true },
  { id: 3, name: "Nike", logo: "👟", description: "Footwear & active sports apparel", featured: true },
];

const EMAIL_TEMPLATES = [
  { id: "order_confirm", name: "Order Confirmation", subject: "Your CommerceOS Order #104 is Confirmed!" },
  { id: "invoice", name: "Tax Invoice Issued", subject: "Invoice #REC-INV-98402 for Order #104" },
  { id: "refund", name: "Refund Processed", subject: "Credit Refund Processed for Order #104" },
  { id: "welcome", name: "Welcome to CommerceOS", subject: "Welcome to CommerceOS Marketplace!" },
  { id: "vendor_approve", name: "Vendor Approval", subject: "Your Merchant Store Profile is Approved!" },
];

export default function AdminCmsPage() {
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [emailPreview, setEmailPreview] = useState(null);

  const [addBannerOpen, setAddBannerOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");

  const handleAddBanner = (e) => {
    e.preventDefault();
    const newBanner = {
      id: banners.length + 1,
      title: bannerTitle,
      subtitle: bannerSubtitle || "Featured Marketplace Campaign",
      badge: "Promo Campaign",
      status: "Active",
      priority: banners.length + 1,
      publish_date: "2026-07-22",
      expiry_date: "2026-08-22",
    };
    setBanners((prev) => [...prev, newBanner]);
    setAddBannerOpen(false);
    setBannerTitle("");
    setBannerSubtitle("");
    toast.success("Hero Banner created successfully!");
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Banner deleted.");
  };

  const toggleBrandFeatured = (id) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, featured: !b.featured } : b))
    );
    toast.success("Brand featured status updated!");
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

      <div className="max-w-7xl mx-auto space-y-8 px-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Homepage CMS & Content Manager</h1>
            <p className="text-slate-500 text-xs mt-1">Control Hero Banners, featured brand showcases, and preview automated customer email templates.</p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setAddBannerOpen(true)}
            icon={Plus}
            className="text-xs font-bold"
          >
            Create Hero Banner
          </Button>
        </div>

        {/* Hero Banners Section */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Active Homepage Hero Banners</h3>
            <span className="text-xs font-bold text-slate-500">{banners.length} Banners Scheduled</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="p-5 bg-slate-900 text-white rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">{b.badge}</span>
                  <Badge status="active">{b.status}</Badge>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{b.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{b.subtitle}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                  <span>Priority: #{b.priority}</span>
                  <span>Expires: {b.expiry_date}</span>
                  <button onClick={() => deleteBanner(b.id)} className="p-1 text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Manager & Featured Brands */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Brand Showcase Manager</h3>
            <span className="text-xs font-bold text-slate-500">{brands.length} Brands Configured</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div key={brand.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{brand.logo}</span>
                  <button
                    onClick={() => toggleBrandFeatured(brand.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      brand.featured ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {brand.featured ? "Featured" : "Standard"}
                  </button>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{brand.name}</h4>
                <p className="text-slate-500 line-clamp-2">{brand.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email Templates Previewer */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Automated Email Notification Templates</h3>
            <span className="text-xs font-bold text-slate-500">{EMAIL_TEMPLATES.length} Email Templates Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {EMAIL_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Mail className="w-4 h-4" />
                  <span>{tmpl.name}</span>
                </div>
                <p className="text-slate-600 line-clamp-1 font-semibold">{tmpl.subject}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEmailPreview(tmpl)}
                  icon={Eye}
                  className="w-full text-xs font-bold"
                >
                  Preview Template
                </Button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Banner Modal */}
      <Modal open={addBannerOpen} onClose={() => setAddBannerOpen(false)} title="Create Homepage Hero Banner" size="md">
        <form onSubmit={handleAddBanner} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Banner Heading Title *</label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="e.g. Winter Electronics Sale"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Subtitle & Offer Details</label>
            <input
              type="text"
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              placeholder="e.g. Up to 50% OFF on Top Audio & Accessories"
              className="input-field"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setAddBannerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">Publish Banner</Button>
          </div>
        </form>
      </Modal>

      {/* Email Preview Drawer */}
      <Modal open={!!emailPreview} onClose={() => setEmailPreview(null)} title={`Email Template — ${emailPreview?.name}`} size="lg">
        {emailPreview && (
          <div className="space-y-4 font-sans text-xs p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700">Subject: <span className="text-slate-900">{emailPreview.subject}</span></p>
              <p className="text-slate-500">Sender: noreply@commerceos.com</p>
            </div>

            <div className="p-6 bg-slate-100/70 border border-slate-200 rounded-2xl text-slate-800 space-y-4 leading-relaxed">
              <h2 className="text-xl font-black text-slate-900">CommerceOS Marketplace</h2>
              <p>Hello Valued Customer,</p>
              <p>This is an automated operational notification regarding your recent activity on CommerceOS.</p>
              <div className="p-4 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 font-bold">
                Status: Verified & Processed
              </div>
              <p className="text-slate-500">Thank you for choosing CommerceOS.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setEmailPreview(null)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
