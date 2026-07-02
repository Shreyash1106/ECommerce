import React, { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, LayoutGrid, List, Filter, ImageOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const STATUSES  = ["All", "In Stock", "Low Stock", "Out of Stock"];
const PAGE_SIZE = 8;
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
  const [view, setView]                 = useState("table");
  const [page, setPage]                 = useState(1);
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
    return matchSearch && matchStatus;
  }), [products, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Products</h1>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} products total</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }} className="btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…" className="input-field pl-9 h-9 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field h-9 text-sm w-auto">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          <button onClick={() => setView("table")} className={`px-3 py-2 transition-colors ${view === "table" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}><List size={15} /></button>
          <button onClick={() => setView("grid")}  className={`px-3 py-2 transition-colors ${view === "grid"  ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}><LayoutGrid size={15} /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="section-card"><EmptyState title="No products found" description="Try adjusting your search or add a new product." icon={Filter} /></div>
      ) : view === "table" ? (
        <div className="section-card">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginated.map((p) => {
                  const qty = p.inventory?.quantity;
                  const status = stockStatus(qty);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <ImageOff size={14} className="text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-200 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td><span className="text-xs text-gray-400">{p.category?.name || "—"}</span></td>
                      <td className="font-semibold text-white">${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`text-xs font-medium ${qty === 0 ? "text-red-400" : qty < 20 ? "text-yellow-400" : "text-gray-300"}`}>
                          {qty ?? "—"}
                        </span>
                      </td>
                      <td><Badge status={status.toLowerCase()}>{status}</Badge></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-indigo-400 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((p) => {
              const qty = p.inventory?.quantity;
              const status = stockStatus(qty);
              return (
                <div key={p.id} className="section-card hover:border-gray-700 transition-colors">
                  <div className="h-40 bg-gray-800 flex items-center justify-center rounded-t-xl">
                    <ImageOff size={32} className="text-gray-600" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-200 leading-snug flex-1 mr-2">{p.name}</h3>
                      <Badge status={status.toLowerCase()}>{status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{p.category?.name || "—"}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-white">${Number(p.price).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{qty ?? 0} left</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="flex-1 btn-secondary text-xs py-1.5 justify-center"><Pencil size={12} /> Edit</button>
                      <button onClick={() => setDeleteTarget(p)} className="btn-danger text-xs py-1.5 px-2.5"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="section-card">
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
