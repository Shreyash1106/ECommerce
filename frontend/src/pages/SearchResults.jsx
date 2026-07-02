import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Package, Filter, X, ChevronDown, Star, ChevronLeft, ChevronRight, Heart, Grid, List, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import AppImage from "../components/ui/AppImage";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get URL params
  const q = searchParams.get("q") || "";
  const category_id = searchParams.get("category_id");
  const brand = searchParams.get("brand");
  const min_price = searchParams.get("min_price");
  const max_price = searchParams.get("max_price");
  const min_rating = searchParams.get("min_rating");
  const min_discount = searchParams.get("min_discount");
  const in_stock = searchParams.get("in_stock");
  const sort_by = searchParams.get("sort_by") || "created_at";
  const sort_order = searchParams.get("sort_order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");

  // Local state
  const [searchQuery, setSearchQuery] = useState(q);
  const [showFilters, setShowFilters] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(category_id ? category_id.split(",") : []);
  const [selectedBrands, setSelectedBrands] = useState(brand ? brand.split(",") : []);
  const [priceRange, setPriceRange] = useState({ min: min_price || "", max: max_price || "" });
  const [ratingFilter, setRatingFilter] = useState(min_rating || "");
  const [discountFilter, setDiscountFilter] = useState(min_discount || "");
  const [stockFilter, setStockFilter] = useState(in_stock === "true");
  const [sortBy, setSortBy] = useState(sort_by);
  const [sortOrder, setSortOrder] = useState(sort_order);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [recentSearches, setRecentSearches] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Custom styles for range slider
  const rangeSliderStyle = `
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #6366f1;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: auto;
      margin-top: -6px;
    }
    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #6366f1;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: auto;
      border: none;
    }
    input[type="range"]::-webkit-slider-runnable-track {
      height: 4px;
      background: transparent;
    }
    input[type="range"]::-moz-range-track {
      height: 4px;
      background: transparent;
    }
  `;

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to localStorage
  const saveSearch = useCallback((query) => {
    if (query && query.length >= 2) {
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(new Set(JSON.parse(saved)));
    }
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId);
      } else {
        updated.add(productId);
      }
      localStorage.setItem("wishlist", JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  // Fetch filter metadata
  const { data: filterMetadata } = useQuery({
    queryKey: ["filter-metadata"],
    queryFn: () => client.get("/search/products/filters/metadata").then((r) => r.data),
  });

  // Fetch search suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ["search-suggestions", debouncedSearchQuery],
    queryFn: () => client.get(`/search/products/suggestions?q=${encodeURIComponent(debouncedSearchQuery)}&limit=8`).then((r) => r.data),
    enabled: debouncedSearchQuery.length >= 2,
  });

  // Build query string
  const buildQueryString = useCallback((params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    return query.toString();
  }, []);

  // Update URL params
  useEffect(() => {
    const params = {
      q: debouncedSearchQuery,
      category_id: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
      brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
      min_price: priceRange.min,
      max_price: priceRange.max,
      min_rating: ratingFilter,
      min_discount: discountFilter,
      in_stock: stockFilter ? "true" : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: page.toString(),
    };
    const queryString = buildQueryString(params);
    setSearchParams(queryString);
  }, [debouncedSearchQuery, selectedCategories, selectedBrands, priceRange, ratingFilter, discountFilter, stockFilter, sortBy, sortOrder, page, buildQueryString, setSearchParams]);

  // Fetch products
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search-products", debouncedSearchQuery, selectedCategories, selectedBrands, priceRange, ratingFilter, discountFilter, stockFilter, sortBy, sortOrder, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.set("q", debouncedSearchQuery);
      if (selectedCategories.length > 0) params.set("category_id", selectedCategories.join(","));
      if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
      if (priceRange.min) params.set("min_price", priceRange.min);
      if (priceRange.max) params.set("max_price", priceRange.max);
      if (ratingFilter) params.set("min_rating", ratingFilter);
      if (discountFilter) params.set("min_discount", discountFilter);
      if (stockFilter) params.set("in_stock", "true");
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder);
      params.set("page", page);
      params.set("limit", "20");
      return client.get(`/search/products?${params.toString()}`).then((r) => r.data);
    },
    enabled: true,
  });

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length >= 2);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    saveSearch(suggestion);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setRatingFilter("");
    setDiscountFilter("");
    setStockFilter(false);
    setSortBy("created_at");
    setSortOrder("desc");
    setSearchQuery("");
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle brand selection
  const toggleBrand = (brandName) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Remove specific filter
  const removeFilter = (filterType, value) => {
    switch (filterType) {
      case "category":
        setSelectedCategories(prev => prev.filter(id => id !== value));
        break;
      case "brand":
        setSelectedBrands(prev => prev.filter(b => b !== value));
        break;
      case "rating":
        setRatingFilter("");
        break;
      case "discount":
        setDiscountFilter("");
        break;
      case "stock":
        setStockFilter(false);
        break;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (searchResults?.total_pages || 1)) {
      searchParams.set("page", newPage);
      setSearchParams(searchParams);
    }
  };

  const products = searchResults?.products || [];
  const total = searchResults?.total || 0;
  const totalPages = searchResults?.total_pages || 1;
  const suggestions = suggestionsData?.suggestions || [];

  return (
    <>
      <style>{rangeSliderStyle}</style>
      <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Search Products</h1>
          {total > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              <span className="text-white font-medium">{total}</span> products found
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Filter size={18} />
            <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search products by name, description, or brand..."
            className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white text-sm"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    saveSearch(search);
                  }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Badges */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0 || ratingFilter || discountFilter || stockFilter) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map(catId => {
            const cat = filterMetadata?.categories?.find(c => c.id.toString() === catId);
            return cat ? (
              <div key={catId} className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full">
                <span>{cat.name}</span>
                <button onClick={() => removeFilter("category", catId)} className="hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ) : null;
          })}
          {selectedBrands.map(brand => (
            <div key={brand} className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full">
              <span>{brand}</span>
              <button onClick={() => removeFilter("brand", brand)} className="hover:text-white">
                <X size={14} />
              </button>
            </div>
          ))}
          {ratingFilter && (
            <div className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full">
              <span>{ratingFilter}+ Rating</span>
              <button onClick={() => removeFilter("rating")} className="hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
          {discountFilter && (
            <div className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full">
              <span>{discountFilter}%+ Discount</span>
              <button onClick={() => removeFilter("discount")} className="hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
          {stockFilter && (
            <div className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm rounded-full">
              <span>In Stock</span>
              <button onClick={() => removeFilter("stock")} className="hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-72 flex-shrink-0">
            <div className="section-card p-4 space-y-6">
              {/* Clear Filters */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              {filterMetadata?.categories && filterMetadata.categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Category</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterMetadata.categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id.toString())}
                          onChange={() => toggleCategory(cat.id.toString())}
                          className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-300">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              {filterMetadata?.brands && filterMetadata.brands.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Brand</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterMetadata.brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-300">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>${priceRange.min || filterMetadata?.price_range?.min || 0}</span>
                    <span>${priceRange.max || filterMetadata?.price_range?.max || 1000}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-700 rounded-lg">
                      <div
                        className="absolute h-2 bg-indigo-500 rounded-lg"
                        style={{
                          left: `${((priceRange.min || filterMetadata?.price_range?.min || 0) / (filterMetadata?.price_range?.max || 1000)) * 100}%`,
                          right: `${100 - ((priceRange.max || filterMetadata?.price_range?.max || 1000) / (filterMetadata?.price_range?.max || 1000)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="range"
                        min={filterMetadata?.price_range?.min || 0}
                        max={filterMetadata?.price_range?.max || 1000}
                        value={priceRange.min || filterMetadata?.price_range?.min || 0}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none"
                        style={{ zIndex: 3 }}
                      />
                      <input
                        type="range"
                        min={filterMetadata?.price_range?.min || 0}
                        max={filterMetadata?.price_range?.max || 1000}
                        value={priceRange.max || filterMetadata?.price_range?.max || 1000}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Minimum Rating</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating.toString() ? "" : rating.toString())}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        ratingFilter === rating.toString()
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <Star size={14} fill={ratingFilter === rating.toString() ? "currentColor" : "none"} />
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Minimum Discount</h4>
                <select
                  value={discountFilter}
                  onChange={(e) => setDiscountFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="10">10% or more</option>
                  <option value="20">20% or more</option>
                  <option value="30">30% or more</option>
                  <option value="50">50% or more</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stockFilter}
                    onChange={(e) => setStockFilter(e.target.checked)}
                    className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">In Stock Only</span>
                </label>
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Sort By</h4>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="discount-desc">Highest Discount</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="section-card animate-pulse">
                  <div className="h-36 bg-gray-800 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="section-card">
              <EmptyState
                icon={Search}
                title="No products found"
                description={searchQuery ? `No products match your search criteria. Try adjusting your filters.` : "Enter a search term or use filters to find products."}
              />
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                {products.map((p) => (
                  viewMode === "grid" ? (
                    <Link key={p.id} to={`/product/${p.id}`} className="section-card hover:border-gray-700 transition-colors block relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(p.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-2 bg-gray-900/50 hover:bg-gray-900 rounded-full transition-colors"
                      >
                        <Heart
                          size={18}
                          className={wishlist.has(p.id) ? "fill-red-500 text-red-500" : "text-white"}
                        />
                      </button>
                      <div className="h-36 bg-gray-800 flex items-center justify-center rounded-t-xl overflow-hidden">
                        {p.image_url ? (
                          <AppImage src={p.image_url} alt={p.name} variant="product" className="w-full h-full object-cover rounded-t-xl" />
                        ) : (
                          <Package size={48} className="text-gray-600" />
                        )}
                        {p.discount_percentage > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {p.discount_percentage}% OFF
                          </div>
                        )}
                        {p.inventory?.quantity > 0 ? (
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            In Stock
                          </div>
                        ) : (
                          <div className="absolute bottom-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {p.brand && (
                          <p className="text-xs text-indigo-400 mb-1">{p.brand}</p>
                        )}
                        <h3 className="text-sm font-medium text-gray-200 truncate mb-1">{p.name}</h3>
                        {p.description && (
                          <p className="text-xs text-gray-500 truncate mb-2">{p.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {p.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                              <span className="text-xs text-gray-400">{p.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-indigo-400">
                            ${Number(p.price).toFixed(2)}
                          </p>
                          {p.discount_percentage > 0 && (
                            <p className="text-sm text-gray-500 line-through">
                              ${(p.price / (1 - p.discount_percentage / 100)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link key={p.id} to={`/product/${p.id}`} className="section-card hover:border-gray-700 transition-colors block relative">
                      <div className="flex gap-4 p-4">
                        <div className="w-32 h-32 bg-gray-800 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0 relative">
                          {p.image_url ? (
                            <AppImage src={p.image_url} alt={p.name} variant="product" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package size={48} className="text-gray-600" />
                          )}
                          {p.discount_percentage > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {p.discount_percentage}% OFF
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {p.brand && (
                                <p className="text-xs text-indigo-400 mb-1">{p.brand}</p>
                              )}
                              <h3 className="text-base font-medium text-gray-200 mb-1">{p.name}</h3>
                              {p.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                {p.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                                    <span className="text-sm text-gray-400">{p.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {p.inventory?.quantity > 0 ? (
                                  <span className="text-xs text-green-400">In Stock</span>
                                ) : (
                                  <span className="text-xs text-gray-500">Out of Stock</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-indigo-400">
                                  ${Number(p.price).toFixed(2)}
                                </p>
                                {p.discount_percentage > 0 && (
                                  <p className="text-sm text-gray-500 line-through">
                                    ${(p.price / (1 - p.discount_percentage / 100)).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(p.id);
                              }}
                              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Heart
                                size={20}
                                className={wishlist.has(p.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isCurrentPage
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === totalPages
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
