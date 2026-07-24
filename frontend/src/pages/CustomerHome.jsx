import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import client from "../api/client";
import {
  Search, ShoppingBag, Flame, Sparkles, Star, ArrowRight,
  TrendingUp, Award, Zap, ChevronLeft, ChevronRight, Package,
  ShieldCheck, Truck, Clock, Percent, Heart, RotateCcw, Lock, DollarSign,
  Eye, ThumbsUp, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ui/ProductCard";
import SkeletonProductCard from "../components/ui/SkeletonProductCard";
import QuickViewModal from "../components/ui/QuickViewModal";

const BANNERS = [
  {
    id: 1,
    title: "Mega Summer Sale: Up to 60% Off On Electronics",
    subtitle: "Premium Laptops, Smartphones, Headphones & Smartwatches at Unbeatable Prices",
    cta: "Shop Now",
    badge: "Limited Time Offer",
    bg: "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700",
    link: "/search?category_id=1",
  },
  {
    id: 2,
    title: "Autumn Fashion & Apparel Collection",
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
  { id: 1, name: "Electronics", icon: "💻", count: "24+ Products", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: 2, name: "Fashion & Clothing", icon: "👔", count: "24+ Products", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: 3, name: "Books & Stationeries", icon: "📚", count: "24+ Products", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: 4, name: "Home & Garden", icon: "🏡", count: "24+ Products", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { id: 5, name: "Sports & Fitness", icon: "⚽", count: "24+ Products", color: "bg-rose-50 text-rose-600 border-rose-200" },
];

const BRANDS = ["Sony", "Apple", "Nike", "Adidas", "Samsung", "Bose", "Levi's", "Puma", "Dell", "Canon", "Dyson", "Garmin"];

// Helper component for Horizontal Carousel
function HorizontalProductRow({ title, subtitle, icon: Icon, products, loading, onQuickView }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[240px] max-w-[240px] flex-shrink-0">
                <SkeletonProductCard />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className="min-w-[240px] max-w-[240px] flex-shrink-0">
                <ProductCard product={product} onQuickView={onQuickView} />
              </div>
            ))}
      </div>
    </section>
  );
}

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Flash Sale countdown timer (02:45:30)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

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

  const flashSaleProducts = products.filter((p) => (p.discount_percentage || 0) > 0).slice(0, 8);
  const trendingProducts = products.filter((p) => (p.rating || 0) >= 4.7).slice(0, 10);
  const bestSellers = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const newArrivals = [...products].reverse().slice(0, 10);
  const recommendedProducts = products.slice(5, 15);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
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
                  className="btn-amber text-sm font-extrabold px-8 py-3.5 flex items-center gap-2 inline-flex rounded-xl"
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

      {/* 4 Trust Badges Strip */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
          <div className="flex items-center gap-3 p-2 border-r border-slate-100 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">24H Express Delivery</p>
              <p className="text-[11px] text-slate-500">On selected products</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-r border-slate-100 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">7 Days Return</p>
              <p className="text-[11px] text-slate-500">Easy return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 border-r border-slate-100 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Secure Payments</p>
              <p className="text-[11px] text-slate-500">100% encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Best Price Guarantee</p>
              <p className="text-[11px] text-slate-500">Unbeatable marketplace prices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-10">
        
        {/* Flash Sale Deals Section (Horizontal Carousel) */}
        <HorizontalProductRow
          title="Flash Deals of the Day"
          subtitle="Huge savings on top selected items. Ends soon!"
          icon={Flame}
          products={flashSaleProducts}
          loading={loading}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Recommended For You (Horizontal Carousel) */}
        <HorizontalProductRow
          title="Recommended For You"
          subtitle="Handpicked items based on your browsing preferences"
          icon={ThumbsUp}
          products={recommendedProducts}
          loading={loading}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

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

        {/* Trending Products (Horizontal Carousel) */}
        <HorizontalProductRow
          title="Trending Products"
          subtitle="Products with massive customer demand this week"
          icon={TrendingUp}
          products={trendingProducts}
          loading={loading}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* Best Sellers (Horizontal Carousel) */}
        <HorizontalProductRow
          title="Marketplace Best Sellers"
          subtitle="Top rated products with certified 5-star customer reviews"
          icon={Award}
          products={bestSellers}
          loading={loading}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

        {/* New Arrivals (Horizontal Carousel) */}
        <HorizontalProductRow
          title="New Arrivals"
          subtitle="Fresh items added to our marketplace catalog"
          icon={Sparkle}
          products={newArrivals}
          loading={loading}
          onQuickView={(p) => setQuickViewProduct(p)}
        />

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
