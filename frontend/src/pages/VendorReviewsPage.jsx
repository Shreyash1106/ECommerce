import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Star, MessageSquare, Award, TrendingUp, Clock, CheckCircle2,
  ShieldCheck, LayoutDashboard, Package, ShoppingCart, BarChart3, Wallet, Store, Reply
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
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

const INITIAL_REVIEWS = [
  { id: 1, customer: "Alex Turner", product: "Wireless Noise Cancelling Headphones", rating: 5, date: "Jul 21, 2026", comment: "Outstanding sound quality! Shipping was under 24 hours.", reply: "Thank you Alex! Enjoy your audio gear." },
  { id: 2, customer: "Sarah Jenkins", product: "Smart Fitness Watch Series 9", rating: 4, date: "Jul 19, 2026", comment: "Great watch, battery life is solid.", reply: null },
  { id: 3, customer: "David Miller", product: "Ultra HD Action Camera 4K", rating: 5, date: "Jul 15, 2026", comment: "Amazing camera, crisp video resolution.", reply: "Thanks David!" },
];

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === replyTarget.id ? { ...r, reply: replyText } : r))
    );
    toast.success("Merchant reply posted successfully!");
    setReplyTarget(null);
    setReplyText("");
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

      <div className="max-w-7xl mx-auto space-y-6 px-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Reviews & Seller Scorecard</h1>
          <p className="text-slate-500 text-xs mt-1">Monitor buyer feedback, post merchant responses, and track your seller performance rating.</p>
        </div>

        {/* Seller Performance Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Overall Seller Rating" value="4.85 / 5.0" icon={Star} color="amber" trend="up" trendValue={4.8} />
          <StatCard title="Order Acceptance Rate" value="99.2%" icon={CheckCircle2} color="green" trend="up" trendValue={1.1} />
          <StatCard title="Avg. Dispatch Speed" value="< 18 Hours" icon={Clock} color="blue" trend="up" trendValue={0} />
          <StatCard title="Merchant Tier Status" value="Super Seller" icon={Award} color="purple" trend="up" trendValue={0} />
        </div>

        {/* Reviews List Card */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Recent Customer Product Reviews</h3>
            <span className="text-xs font-bold text-slate-500">{reviews.length} Verified Feedback Entries</span>
          </div>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{r.customer}</span>
                    <span className="text-slate-400 font-semibold">•</span>
                    <span className="text-slate-500 font-semibold">{r.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400 font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-slate-600 font-semibold">{r.comment}</p>
                <p className="text-[11px] font-bold text-blue-600">Product: {r.product}</p>

                {r.reply ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl mt-2 text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Merchant Reply:</span>
                    <span>{r.reply}</span>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setReplyTarget(r); setReplyText(""); }}
                      icon={Reply}
                      className="text-xs font-bold"
                    >
                      Reply to Customer
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reply Modal */}
      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title="Post Merchant Reply" size="md">
        <form onSubmit={handleReplySubmit} className="space-y-4 font-sans text-xs">
          <p className="text-slate-600">Replying to review by <strong className="text-slate-900">{replyTarget?.customer}</strong>:</p>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response to the customer…"
            className="input-field resize-none"
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setReplyTarget(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">Post Reply</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
