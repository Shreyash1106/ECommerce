import React, { useState, useMemo } from "react";
import { Search, ShoppingCart, LayoutDashboard, Package, BarChart3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 6;

const VENDOR_TABS = [
  { label: "Vendor Overview", icon: LayoutDashboard, to: "/vendor/dashboard" },
  { label: "My Products", icon: Package, to: "/vendor/products" },
  { label: "My Orders", icon: ShoppingCart, to: "/vendor/orders" },
  { label: "Analytics", icon: BarChart3, to: "/vendor/analytics" },
];

export default function VendorOrders() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage]                 = useState(1);
  const queryClient = useQueryClient();

  const { data: apiOrders, isLoading, isError } = useQuery({
    queryKey: ["vendorOrdersList"],
    queryFn: () => client.get("/orders").then((r) => Array.isArray(r.data) ? r.data : []),
    retry: 1,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      client.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorOrdersList"] });
      toast.success("Order status updated!");
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to update order status."),
  });

  const filtered = useMemo(() => {
    const orders = (apiOrders || []).map((o) => ({
      id:           o.id,
      customer:     o.customer || `User #${o.user_id}`,
      email:        o.email || "",
      product_name: o.product_name || `Product #${o.product_id}`,
      date:         o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
      items:        o.quantity || 1,
      total:        o.total_price || 0,
      status:       o.status || "Pending",
    }));
    return orders.filter((o) => {
      const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [apiOrders, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  if (isError) return (
    <div className="page-container font-sans">
      <EmptyState icon={ShoppingCart} title="Could not load orders" description="Backend is offline or returned an error." />
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 pb-10 bg-slate-50 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {VENDOR_TABS.map((tab) => {
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
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Orders</h1>
          <p className="text-slate-500 text-xs mt-1">{filtered.length} orders matched</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or ID…" className="input-field pl-10" />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState icon={ShoppingCart} title="No orders found" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Order</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Customer</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase">Product</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">#{o.id}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-900">{o.customer}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[160px]">{o.product_name}</td>
                        <td className="px-6 py-4 text-xs font-extrabold text-slate-900 text-right">${Number(o.total).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => statusMutation.mutate({ orderId: o.id, status: e.target.value })}
                            className="bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
                          >
                            {STATUSES.filter(s => s !== "All").map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
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
    </div>
  );
}
