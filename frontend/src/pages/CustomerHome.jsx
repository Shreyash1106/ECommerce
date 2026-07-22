import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import client from "../api/client";
import {
  Search, ShoppingBag, Flame, Sparkles, Star, ArrowRight,
  TrendingUp, Award, Zap, ChevronLeft, ChevronRight, Package,
  ShieldCheck, Truck, Clock, Percent, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ui/ProductCard";
import SkeletonProductCard from "../components/ui/SkeletonProductCard";
import QuickViewModal from "../components/ui/QuickViewModal";

const BANNERS = [
  {
    id: 1,
    title: "Summer Electronics Festival",
    subtitle: "Up to 40% OFF on Top Laptops, Smartwatches & Audio Gear",
    cta: "Explore Tech Deals",
    badge: "Limited Time Offer",
    bg: "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700",
    link: "/search?category_id=1",
  },
  {
    id: 2,
    title: "Autumn Fashion Collection",
    subtitle: "Discover Trending Apparel, Footwear & Designer Accessories",
    cta: "Shop Fashion",
    badge: "New Arrivals",
    bg: "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600",
    link: "/search?category_id=2",
  },
  {
    id: 3,
    title: "Express 24-Hour Home Delivery",
    subtitle: "Free Shipping on Orders Over $100 across All Categories",
    cta: "Start Shopping",
    badge: "Prime Service",
    bg: "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950",
    link: "/search",
  },
];

const CATEGORY_CARDS = [
  { id: 1, name: "Electronics", icon: "💻", count: "1,240+ Products", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: 2, name: "Fashion & Clothing", icon: "👔", count: "3,850+ Products", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: 3, name: "Books & Stationeries", icon: "📚", count: "920+ Products", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: 4, name: "Home & Garden", icon: "🏡", count: "2,150+ Products", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: 5, name: "Sports & Fitness", icon: "⚽", count: "780+ Products", color: "bg-rose-50 text-rose-600 border-rose-200" },
];

const BRANDS = ["Sony", "Apple", "Nike", "Adidas", "Samsung", "Bose", "Levi's", "Puma"];

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Flash Sale countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await client.get("/products");
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const flashSaleProducts = products.filter((p) => (p.discount_percentage || 0) > 0).slice(0, 4);
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl space-y-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> {BANNERS[bannerIndex].badge}
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {BANNERS[bannerIndex].title}
              </h1>
              <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                {BANNERS[bannerIndex].subtitle}
              </p>
              <div className="pt-2">
                <Link
                  to={BANNERS[bannerIndex].link}
                  className="btn-amber text-sm font-extrabold px-8 py-4 flex items-center gap-2 inline-flex"
                >
                  {BANNERS[bannerIndex].cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel dots */}
          <div className="flex items-center gap-2 mt-8">
            {BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBannerIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === bannerIndex ? "w-8 bg-amber-500" : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-10">
        
        {/* Flash Sale Banner Section */}
        <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-[24px] p-6 md:p-8 shadow-xl text-slate-950">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-950 text-amber-400 rounded-2xl shadow-md">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Flash Sale - Today's Mega Deals</h2>
                <p className="text-xs font-bold text-slate-900 mt-0.5">Huge savings on top selected items. Ends soon!</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-2xl shadow-md font-mono">
              <Clock className="w-4 h-4 text-amber-400 mr-1" />
              <span className="font-extrabold text-base">{String(timeLeft.hours).padStart(2, "0")}h</span>:
              <span className="font-extrabold text-base">{String(timeLeft.minutes).padStart(2, "0")}m</span>:
              <span className="font-extrabold text-base">{String(timeLeft.seconds).padStart(2, "0")}s</span>
            </div>
          </div>

          {/* Flash Sale Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Categories Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Top Categories</h2>
              <p className="text-xs text-slate-500 mt-0.5">Browse products by your favorite department</p>
            </div>
            <Link to="/search" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category_id=${cat.id}`}
                className={`p-5 rounded-[20px] border ${cat.color} hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 group`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-extrabold text-sm text-slate-900">{cat.name}</h3>
                <p className="text-[11px] font-semibold text-slate-500">{cat.count}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Featured Marketplace Items</h2>
              <p className="text-xs text-slate-500 mt-0.5">Handpicked premium products with top customer ratings</p>
            </div>
            <Link to="/search" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Popular Brands Showcase */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-sm space-y-4">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Featured Official Brands</h3>
            <p className="text-xs text-slate-500 mt-1">Directly sourced from certified brand partners</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {BRANDS.map((brand, idx) => (
              <Link
                key={idx}
                to={`/search?brand=${brand}`}
                className="px-6 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl text-sm font-extrabold text-slate-800 hover:text-blue-600 transition-all shadow-sm"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
