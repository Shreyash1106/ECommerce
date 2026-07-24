import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Package, Filter, X, ChevronDown, Star, ChevronLeft, ChevronRight, Heart, Grid, List, Clock, SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import ProductCard from "../components/ui/ProductCard";
import QuickViewModal from "../components/ui/QuickViewModal";

const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Home & Garden" },
  { id: 5, name: "Sports" },
];

const BRANDS = ["All", "Sony", "Apple", "Nike", "Adidas", "Samsung", "Bose", "Levi's", "Puma", "Dell", "Canon", "Dyson", "Garmin"];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const category_id = searchParams.get("category_id") || "All";
  const brand = searchParams.get("brand") || "All";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";
  const min_rating = searchParams.get("min_rating") || "";
  const in_stock = searchParams.get("in_stock") === "true";
  const sort_by = searchParams.get("sort_by") || "created_at";

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(category_id);
  const [selectedBrand, setSelectedBrand] = useState(brand);
  const [priceMin, setPriceMin] = useState(min_price);
  const [priceMax, setPriceMax] = useState(max_price);
  const [ratingMin, setRatingMin] = useState(min_rating);
  const [inStockOnly, setInStockOnly] = useState(in_stock);
  const [sortBy, setSortBy] = useState(sort_by);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(q);
    setSelectedCategory(category_id);
    setSelectedBrand(brand);
    setPriceMin(min_price);
    setPriceMax(max_price);
    setRatingMin(min_rating);
    setInStockOnly(in_stock);
    setSortBy(sort_by);
  }, [q, category_id, brand, min_price, max_price, min_rating, in_stock, sort_by]);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["searchProducts", q, category_id, brand, min_price, max_price, min_rating, in_stock, sort_by],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (category_id && category_id !== "All") params.append("category_id", category_id);
      if (brand && brand !== "All") params.append("brand", brand);
      if (min_price) params.append("min_price", min_price);
      if (max_price) params.append("max_price", max_price);
      if (min_rating) params.append("min_rating", min_rating);
      if (in_stock) params.append("in_stock", "true");
      if (sort_by) params.append("sort_by", sort_by);
      const res = await client.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery);
    if (selectedCategory && selectedCategory !== "All") params.append("category_id", selectedCategory);
    if (selectedBrand && selectedBrand !== "All") params.append("brand", selectedBrand);
    if (priceMin) params.append("min_price", priceMin);
    if (priceMax) params.append("max_price", priceMax);
    if (ratingMin) params.append("min_rating", ratingMin);
    if (inStockOnly) params.append("in_stock", "true");
    if (sortBy) params.append("sort_by", sortBy);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceMin("");
    setPriceMax("");
    setRatingMin("");
    setInStockOnly(false);
    setSortBy("created_at");
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Search Header Bar */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
          <form onSubmit={handleApplyFilter} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, description or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div className="flex gap-2">
              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  const params = new URLSearchParams(searchParams);
                  params.set("sort_by", e.target.value);
                  setSearchParams(params);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="created_at">Sort: Newest First</option>
                <option value="price_asc">Sort: Price Low to High</option>
                <option value="price_desc">Sort: Price High to Low</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="discount">Sort: Biggest Discounts</option>
              </select>

              <button type="submit" className="btn-primary text-xs font-black px-6 py-3 rounded-xl whitespace-nowrap">
                Search & Filter
              </button>
            </div>
          </form>

          {/* Active Filter Tags Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">Active Filters:</span>
              {q && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">Query: "{q}"</span>}
              {category_id !== "All" && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-bold">
                  Cat: {CATEGORIES.find((c) => String(c.id) === String(category_id))?.name || category_id}
                </span>
              )}
              {brand !== "All" && <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold">Brand: {brand}</span>}
              {min_price && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">Min: ${min_price}</span>}
              {max_price && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">Max: ${max_price}</span>}
              {min_rating && <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-bold">Rating: {min_rating}+ ★</span>}
              {in_stock && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">In Stock Only</span>}
              
              <button onClick={handleResetFilters} className="text-rose-600 hover:underline font-bold text-xs ml-2 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            </div>

            <span className="font-extrabold text-slate-900">{products.length} Products Found</span>
          </div>
        </div>

        {/* 2 Column Main Layout: Left Sidebar Filters (1 col) + Right Product Grid (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar Filters Panel */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-6 h-fit">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Marketplace
              </h3>
            </div>

            {/* 1. Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Department</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="All">All Departments</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Brand Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 3. Price Range Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Price Range ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="input-field text-xs py-2"
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            {/* 4. Minimum Rating Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">Minimum Rating</label>
              <div className="space-y-1.5">
                {[
                  { label: "4.5 & Above ★", val: "4.5" },
                  { label: "4.0 & Above ★", val: "4.0" },
                  { label: "3.5 & Above ★", val: "3.5" },
                  { label: "All Ratings", val: "" },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRatingMin(r.val)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      ratingMin === r.val ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{r.label}</span>
                    {ratingMin === r.val && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. In-Stock Only Switch */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={handleApplyFilter}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all"
            >
              Apply All Filters
            </button>
          </div>

          {/* Right 3 Cols: Filtered Product Results Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : isError || products.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-12 text-center shadow-sm">
                <EmptyState icon={Package} title="No matching products found" description="Try adjusting your filter criteria or clearing search parameters." />
                <button onClick={handleResetFilters} className="mt-4 btn-secondary text-xs font-bold">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
