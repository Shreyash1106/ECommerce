import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Package, Filter, X, ChevronDown, Star, ChevronLeft, ChevronRight, Heart, Grid, List, Clock, SlidersHorizontal } from "lucide-react";
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

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") || "";
  const category_id = searchParams.get("category_id");
  const brand = searchParams.get("brand");
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";
  const sort_by = searchParams.get("sort_by") || "created_at";

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(category_id || "All");
  const [priceMin, setPriceMin] = useState(min_price);
  const [priceMax, setPriceMax] = useState(max_price);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["searchProducts", q, category_id, brand, min_price, max_price, sort_by],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (category_id && category_id !== "All") params.append("category_id", category_id);
      if (brand) params.append("brand", brand);
      if (min_price) params.append("min_price", min_price);
      if (max_price) params.append("max_price", max_price);
      if (sort_by) params.append("sort_by", sort_by);
      const res = await client.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery);
    if (selectedCategory && selectedCategory !== "All") params.append("category_id", selectedCategory);
    if (priceMin) params.append("min_price", priceMin);
    if (priceMax) params.append("max_price", priceMax);
    if (sort_by) params.append("sort_by", sort_by);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search & Filter Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button type="submit" className="btn-primary">
              Filter Results
            </button>
          </form>

          {/* Active search tag */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <span>
              Showing results {q && <span>for "<strong className="text-slate-900">{q}</strong>"</span>}
            </span>
            <span>{products.length} products found</span>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError || products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <EmptyState icon={Package} title="No products found" description="Try adjusting your search terms or filters." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
