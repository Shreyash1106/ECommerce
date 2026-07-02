import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, Pencil, Trash2, LayoutGrid, List, Filter, ImageOff, Heart, Eye, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const STATUSES  = ["All", "In Stock", "Low Stock", "Out of Stock"];
const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", price: "", category_id: "", description: "" };

const stockStatus = (qty) => {
  if (qty === undefined || qty === null) return "In Stock";
  if (qty === 0) return "Out of Stock";
  if (qty < 20) return "Low Stock";
  return "In Stock";
};

function ProductForm({ form, onChange, onSubmit, submitLabel, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name</label>
          <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="input-field" required placeholder="Product name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Price ($)</label>
          <input type="number" step="0.01" min="0" value={form.price}
            onChange={(e) => onChange({ ...form, price: e.target.value })}
            className="input-field" required placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Category ID</label>
          <input type="number" min="1" value={form.category_id}
            onChange={(e) => onChange({ ...form, category_id: e.target.value })}
            className="input-field" placeholder="e.g. 1" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="input-field resize-none" placeholder="Product description" rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatus]       = useState("All");
  const [view, setView]                 = useState("grid");
  const [page, setPage]                 = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => client.get("/banners").then((r) => r.data),
    retry: 1,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => client.get("/categories").then((r) => r.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data) => client.post("/products", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminProducts"] }); toast.success("Product created!"); setCreateOpen(false); setForm(EMPTY_FORM); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to create product."),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => client.put(`/products/${data.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminProducts"] }); toast.success("Product updated!"); setEditTarget(null); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to update product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["adminProducts"] }); toast.success("Product deleted!"); setDeleteTarget(null); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to delete product."),
  });

  const filtered = useMemo(() => products.filter((p) => {
    const qty = p.inventory?.quantity;
    const status = stockStatus(qty);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || status === statusFilter;
    const matchCategory = !selectedCategory || (p.category && Number(p.category.id) === Number(selectedCategory));
    return matchSearch && matchStatus && matchCategory;
  }), [products, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // auto-advance slider every 4 seconds
    if (!banners || banners.length === 0) return;
    const id = setInterval(() => setCurrentSlide((s) => (s + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners]);

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: form.name, price: parseFloat(form.price), description: form.description, category_id: form.category_id ? parseInt(form.category_id) : null });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editTarget.id, name: form.name, price: parseFloat(form.price), description: form.description, category_id: form.category_id ? parseInt(form.category_id) : null });
  };

  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), category_id: String(p.category_id || ""), description: p.description || "" });
    setEditTarget(p);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError) return (
    <div className="page-container">
      <EmptyState title="Could not load products" description="Backend is offline or returned an error." icon={Filter} />
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Products</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} products total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products…" className="input-field pl-9 h-9 text-sm w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field h-9 text-sm w-auto">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field h-9 text-sm w-auto">
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <div>
            <button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }} className="btn-primary">
              <Plus size={15} /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Banner slider */}
      <div className="mb-6">
        <div className="relative w-full overflow-hidden rounded-xl bg-gray-800">
          <div ref={slideRef} className="flex transition-transform duration-700" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {(banners.length ? banners : [{ image_url: "https://via.placeholder.com/1200x380?text=No+Banners" }]).map((b, i) => (
              <div key={i} className="w-full flex-shrink-0">
                <img src={b.image_url || b.url || "https://via.placeholder.com/1200x380?text=No+Banners"} alt={b.title || `banner-${i}`} className="w-full h-44 sm:h-56 md:h-64 object-cover" />
              </div>
            ))}
          </div>
          {banners.length > 0 && (
            <>
              <button onClick={() => setCurrentSlide((s) => (s - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentSlide((s) => (s + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full ${i === currentSlide ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories scroller */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto py-2">
          {(categories.length ? categories : [{ id: "all", name: "All" }]).map((c) => (
            <button key={c.id} onClick={() => { setSelectedCategory(c.id === undefined ? null : c.id); setPage(1); }}
              className={`flex-shrink-0 min-w-[110px] px-3 py-2 bg-gray-800 rounded-lg flex items-center gap-3 transition-shadow ${selectedCategory && Number(selectedCategory) === Number(c.id) ? "ring-2 ring-indigo-500" : "hover:shadow-lg"}`}>
              <img src={c.image_url || c.icon || "https://via.placeholder.com/64?text=Cat"} alt={c.name} className="w-10 h-10 rounded-md object-cover" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-200">{c.name}</div>
                <div className="text-xs text-gray-400">{c.product_count ? `${c.product_count} items` : ""}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="section-card animate-pulse">
              <div className="h-44 bg-gray-800 rounded-t-lg" />
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card"><EmptyState title="No products found" description="Try adjusting your search or add a new product." icon={Filter} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map((p) => {
              const qty = p.inventory?.quantity;
              const status = stockStatus(qty);
              const img = p.images?.[0]?.url || p.image_url || p.thumbnail_url || "https://via.placeholder.com/400x300?text=No+Image";
              const discount = p.discount_percent || p.discount || 0;
              const rating = p.rating || p.avg_rating || 0;
              return (
                <div key={p.id} className="bg-gray-850 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative h-44 bg-gray-800">
                    <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-2 bg-black/30 rounded-full text-white hover:bg-black/50">
                      <Heart size={16} />
                    </button>
                    {discount > 0 && (
                      <div className="absolute left-2 top-2 bg-red-600 text-white text-xs px-2 py-1 rounded">{discount}% OFF</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-200 truncate">{p.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400 text-xs"><Star size={14} /> <span className="text-xs">{rating || "—"}</span></div>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 truncate">{p.category?.name || "—"}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-base font-bold text-white">${Number(p.price).toFixed(2)}</div>
                        {p.compare_at_price && <div className="text-xs text-gray-400 line-through">${Number(p.compare_at_price).toFixed(2)}</div>}
                      </div>
                      <div className="text-xs text-gray-400">{qty ?? 0} left</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/products/${p.id}`)} className="flex-1 btn-secondary text-xs py-1.5 justify-center"><Eye size={12} /> View</button>
                      <button onClick={() => openEdit(p)} className="flex-1 btn-outline text-xs py-1.5 justify-center"><Pencil size={12} /> Edit</button>
                      <button onClick={() => setDeleteTarget(p)} className="btn-danger text-xs py-1.5 px-2.5"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="section-card mt-4">
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product">
        <ProductForm form={form} onChange={setForm} onSubmit={handleCreate} submitLabel="Create Product" loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Product">
        <ProductForm form={form} onChange={setForm} onSubmit={handleUpdate} submitLabel="Save Changes" loading={updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-gray-300 mb-1">Delete <span className="font-semibold text-white">"{deleteTarget?.name}"</span>?</p>
          <p className="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="btn-danger border-red-500/50 bg-red-600/20 text-red-400">
              {deleteMutation.isPending ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
