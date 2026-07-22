import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ChevronUp, Mail, ShieldCheck, Truck, RotateCcw, Headphones, Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 text-sm font-sans pt-12 pb-24 md:pb-12 border-t border-slate-800">
      
      {/* Back to top button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-full border border-slate-700 transition-colors shadow-md"
        >
          <ChevronUp className="w-4 h-4" /> Back to top
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
          <Truck className="w-8 h-8 text-amber-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Express Delivery</h4>
          <p className="text-xs text-slate-400 mt-1">Fast shipping on all eligible orders</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
          <ShieldCheck className="w-8 h-8 text-blue-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Secure Payments</h4>
          <p className="text-xs text-slate-400 mt-1">100% encrypted & protected transactions</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
          <RotateCcw className="w-8 h-8 text-emerald-400 mb-2" />
          <h4 className="font-bold text-white text-sm">Easy Returns</h4>
          <p className="text-xs text-slate-400 mt-1">Hassle-free 30-day return policy</p>
        </div>
        <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
          <Headphones className="w-8 h-8 text-purple-400 mb-2" />
          <h4 className="font-bold text-white text-sm">24/7 Support</h4>
          <p className="text-xs text-slate-400 mt-1">Dedicated customer care assistance</p>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">CommerceOS</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Your premier online marketplace destination for high quality electronics, fashion, books, home appliances, and sports gear.
          </p>

          {/* Newsletter Form */}
          <div className="pt-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Subscribe to Exclusive Deals</h5>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/home" className="hover:text-amber-400 transition-colors">Home Page</Link></li>
            <li><Link to="/search" className="hover:text-amber-400 transition-colors">Featured Catalog</Link></li>
            <li><Link to="/search?sort_by=discount" className="hover:text-amber-400 transition-colors">Today's Deals</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Shopping Cart</Link></li>
            <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Account Profile</Link></li>
          </ul>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Top Categories</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/search?category_id=1" className="hover:text-amber-400 transition-colors">Electronics & Accessories</Link></li>
            <li><Link to="/search?category_id=2" className="hover:text-amber-400 transition-colors">Fashion Apparel</Link></li>
            <li><Link to="/search?category_id=3" className="hover:text-amber-400 transition-colors">Books & Literature</Link></li>
            <li><Link to="/search?category_id=4" className="hover:text-amber-400 transition-colors">Home & Living</Link></li>
            <li><Link to="/search?category_id=5" className="hover:text-amber-400 transition-colors">Sports & Fitness</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-xs">
            <li><span className="text-slate-400">Help Center / FAQs</span></li>
            <li><span className="text-slate-400">Track Order Status</span></li>
            <li><span className="text-slate-400">Shipping & Delivery Policy</span></li>
            <li><span className="text-slate-400">Returns & Refund Policy</span></li>
            <li><span className="text-slate-400">Contact Support</span></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} CommerceOS Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
}
