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
const PAGE_SIZE = 15;
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

  // Ensure only one "All" category
  const filteredCategories = useMemo(() => {
    const all = { id: "all", name: "All" };
    const cats = categories.filter((c) => c.name !== "All");
    return [all, ...cats];
  }, [categories]);

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
          <p className="text-xs text-gray-500">{filtered.length} products total</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="bg-gray-800 border-none rounded-xl pl-9 pr-3 h-11 text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-gray-800 border-none rounded-xl h-11 text-sm text-gray-300 px-3"
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border-none rounded-xl h-11 text-sm text-gray-300 px-3"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button
            onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-11 rounded-xl flex items-center gap-2 font-medium text-sm transition"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative w-full overflow-hidden rounded-2xl bg-gray-800">
          <div ref={slideRef} className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {(banners.length ? banners : [{ image_url: "https://via.placeholder.com/1200x380?text=No+Banners" }]).map((b, i) => (
              <div key={i} className="w-full flex-shrink-0">
                <img src={b.image_url || b.url || "https://via.placeholder.com/1200x380?text=No+Banners"} alt={b.title || ""} className="w-full h-48 md:h-64 object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Categories</h2>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] custom-scrollbar">
            {(filteredCategories.length ? filteredCategories : [{ id: "all", name: "All" }]).map((c) => (
              <button key={c.id} onClick={() => { setSelectedCategory(c.id === undefined ? null : c.id); setPage(1); }}
                className={`text-left px-4 py-2.5 rounded-xl text-sm transition ${selectedCategory && Number(selectedCategory) === Number(c.id) ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paginated.map((p) => {
          const qty = p.inventory?.quantity;
          const img = p.images?.[0]?.url || p.image_url || p.thumbnail_url || "https://via.placeholder.com/400x300?text=No+Image";
          return (
            <div key={p.id} className="bg-gray-800 rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all border border-gray-700/50 flex flex-col h-full">
                <img src={img} alt={p.name} className="w-full aspect-[4/3] object-cover rounded-lg mb-3" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }} />
                <h3 className="font-medium text-white text-sm truncate">{p.name}</h3>
                <p className="text-indigo-400 font-bold mt-1 text-lg">${Number(p.price).toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 h-11 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition">Edit</button>
                  <button onClick={() => setDeleteTarget(p)} className="flex-1 h-11 text-sm bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded transition flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product">
        <ProductForm form={form} onChange={setForm} onSubmit={handleCreate} submitLabel="Create Product" loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Product">
        <ProductForm form={form} onChange={setForm} onSubmit={handleUpdate} submitLabel="Save Changes" loading={updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-gray-300 mb-1">Delete <span className="font-semibold text-white">{deleteTarget?.name}</span>?</p>
          <p className="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-secondary text-sm py-2 px-4 whitespace-nowrap">Cancel</button>
            <button
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              className="flex-1 btn-danger border-red-500/50 bg-red-600/20 text-red-400 text-sm py-2 px-4 whitespace-nowrap"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
