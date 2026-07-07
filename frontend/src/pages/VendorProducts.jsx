import React, { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, ImageOff, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const PAGE_SIZE = 6;
const EMPTY_FORM = { name: "", price: "", description: "", category_id: "" };

const stockStatus = (qty) => {
  if (qty === undefined || qty === null) return "In Stock";
  if (qty === 0) return "Out of Stock";
  if (qty < 20) return "Low Stock";
  return "In Stock";
};

function ProductForm({ form, setForm, onSubmit, submitLabel, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required placeholder="Product name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Price ($)</label>
          <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Category ID</label>
          <input type="number" min="1" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field" placeholder="e.g. 1" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} placeholder="Product description" />
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

export default function VendorProducts() {
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["vendorProductsList"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data) => client.post("/products", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorProductsList"] }); toast.success("Product added!"); setCreateOpen(false); setForm(EMPTY_FORM); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to create product."),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => client.put(`/products/${data.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorProductsList"] }); toast.success("Product updated!"); setEditTarget(null); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to update product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorProductsList"] }); toast.success("Product removed."); setDeleteTarget(null); },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to delete product."),
  });

  const filtered = useMemo(() =>
    products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), description: p.description || "", category_id: String(p.category_id || "") });
    setEditTarget(p);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: form.name, price: parseFloat(form.price), description: form.description, category_id: form.category_id ? parseInt(form.category_id) : null });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editTarget.id, name: form.name, price: parseFloat(form.price), description: form.description, category_id: form.category_id ? parseInt(form.category_id) : null });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError) return (
    <div className="page-container">
      <EmptyState icon={Package} title="Could not load products" description="Backend is offline or returned an error." />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-10 px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white px-5 h-11 rounded-xl flex items-center gap-2 font-semibold text-sm transition-all hover:-translate-y-0.5">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full bg-gray-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
      </div>

      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Package} title="No products yet" description="Add your first product to get started"
              action={<button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]">Add Product</button>} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map((p) => {
                    const qty = p.inventory?.quantity;
                    const status = stockStatus(qty);
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              <ImageOff size={16} className="text-gray-500" />
                            </div>
                            <span className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">${Number(p.price).toFixed(2)}</td>
                        <td className={`px-6 py-4 text-sm font-semibold ${qty === 0 ? "text-red-400" : qty < 20 ? "text-amber-400" : "text-gray-300"}`}>{qty ?? "—"}</td>
                        <td className="px-6 py-4"><Badge status={status.toLowerCase()}>{status}</Badge></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 transition-all"><Pencil size={16} /></button>
                            <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product">
        <ProductForm form={form} setForm={setForm} onSubmit={handleCreate} submitLabel="Add Product" loading={createMutation.isPending} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Product">
        <ProductForm form={form} setForm={setForm} onSubmit={handleEdit} submitLabel="Save Changes" loading={updateMutation.isPending} />
      </Modal>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Product" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-gray-300 mb-1">Remove <span className="font-semibold text-white">"{deleteTarget?.name}"</span>?</p>
          <p className="text-xs text-gray-500 mb-5">This cannot be undone.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="btn-danger border-red-500/50 bg-red-600/20 text-red-400">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
