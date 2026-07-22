import React, { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, LayoutGrid, List, Filter, ImageOff, LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const PAGE_SIZE = 12;
const EMPTY_FORM = { name: "", price: "", category_id: "", description: "" };

const ADMIN_TABS = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
];

const stockStatus = (qty) => {
  if (qty === undefined || qty === null) return "In Stock";
  if (qty === 0) return "Out of Stock";
  if (qty < 20) return "Low Stock";
  return "In Stock";
};

function ProductForm({ form, onChange, onSubmit, submitLabel, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 font-sans">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name *</label>
          <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="input-field" required placeholder="Product name" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price ($) *</label>
          <input type="number" step="0.01" min="0" value={form.price}
            onChange={(e) => onChange({ ...form, price: e.target.value })}
            className="input-field" required placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category ID</label>
          <input type="number" min="1" value={form.category_id}
            onChange={(e) => onChange({ ...form, category_id: e.target.value })}
            className="input-field" placeholder="e.g. 1" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="input-field resize-none" placeholder="Product description" rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="submit" disabled={loading} className="btn-primary text-xs font-bold w-full">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [addOpen, setAddOpen]           = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const queryClient                     = useQueryClient();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => client.get("/products").then((r) => r.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data) => client.post("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Product created!");
      setAddOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to create product."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => client.put(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Product updated!");
      setEditProduct(null);
      setForm(EMPTY_FORM);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to update product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => client.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Product deleted.");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to delete product."),
  });

  const filtered = useMemo(() => products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  ), [products, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError) return (
    <div className="page-container font-sans">
      <EmptyState icon={Package} title="Could not load products" description="Backend is offline or returned an error." />
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Marketplace Products</h1>
            <p className="text-slate-500 text-xs mt-1">{filtered.length} products listed</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }} className="btn-primary text-xs">
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input-field pl-10" />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState icon={Package} title="No products found" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Product</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Price</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Stock Status</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((p) => {
                      const qty = p.inventory?.quantity ?? null;
                      const status = stockStatus(qty);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                {p.image_url ? (
                                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  <ImageOff size={16} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{p.name}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-slate-900 text-xs">${Number(p.price).toFixed(2)}</td>
                          <td className="px-6 py-4"><Badge status={status}>{status}</Badge></td>
                          <td className="px-6 py-4 text-right space-x-1">
                            <button onClick={() => { setEditProduct(p); setForm({ name: p.name, price: p.price, description: p.description || "", category_id: p.category_id || "" }); }} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" size="md">
        <ProductForm form={form} onChange={setForm} onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, price: parseFloat(form.price), category_id: form.category_id ? parseInt(form.category_id) : undefined }); }} submitLabel="Create Product" loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="md">
        <ProductForm form={form} onChange={setForm} onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editProduct.id, data: { ...form, price: parseFloat(form.price), category_id: form.category_id ? parseInt(form.category_id) : undefined } }); }} submitLabel="Save Changes" loading={updateMutation.isPending} />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <div className="text-center py-2 space-y-4">
          <p className="text-xs text-slate-700">Delete <strong className="text-slate-900">"{deleteTarget?.name}"</strong>?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary text-xs">Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="btn-danger text-xs">
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
