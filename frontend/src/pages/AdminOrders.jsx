import React, { useState, useMemo } from "react";
import { Search, ShoppingCart, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 8;

const normalise = (o) => ({
  id:       o.id,
  customer: o.customer || `User #${o.user_id}`,
  email:    o.email    || "",
  date:     o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
  items:    o.quantity || 1,
  total:    o.total_price || 0,
  status:   o.status || "Pending",
});

export default function AdminOrders() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage]                 = useState(1);
  const [viewOrder, setViewOrder]       = useState(null);

  const { data: apiOrders, isLoading, isError } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => client.get("/orders").then((r) => Array.isArray(r.data) ? r.data : []),
    retry: 1,
  });

  const orders = useMemo(() => (apiOrders || []).map(normalise), [apiOrders]);

  const counts = useMemo(() => STATUSES.reduce((acc, s) => {
    acc[s] = s === "All" ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {}), [orders]);

  const filtered = useMemo(() => orders.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError) return (
    <div className="page-container">
      <EmptyState icon={ShoppingCart} title="Could not load orders" description="Backend is offline or returned an error." />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-10 px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} total orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-4 text-left transition-all duration-200 rounded-2xl border ${
              statusFilter === s 
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]" 
                : "bg-gray-900/40 backdrop-blur-md border-white/5 hover:bg-white/5 hover:border-white/10"
            }`}>
            <p className={`text-2xl font-bold ${statusFilter === s ? "text-indigo-400" : "text-white"}`}>{counts[s]}</p>
            <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mt-1">{s}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or ID…" className="w-full bg-gray-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
      </div>

      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={ShoppingCart} title="No orders found" description="Try adjusting your search or filter" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginated.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-indigo-400 font-bold">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{o.customer}</p>
                        {o.email && <p className="text-xs font-medium text-gray-500 mt-0.5">{o.email}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm font-medium">{o.date}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{o.items} item{o.items !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-4 font-bold text-white">${Number(o.total).toFixed(2)}</td>
                      <td className="px-6 py-4"><Badge status={o.status.toLowerCase()}>{o.status}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setViewOrder(o)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/20">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder?.id}`} size="sm">
        {viewOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge status={viewOrder.status.toLowerCase()}>{viewOrder.status}</Badge>
              <span className="text-xs text-gray-500">{viewOrder.date}</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 space-y-2.5">
              {[["Customer", viewOrder.customer], ["Email", viewOrder.email || "—"], ["Items", viewOrder.items]].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-200 font-medium">{val}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs border-t border-gray-700 pt-2.5">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-white font-bold">${Number(viewOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
