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
    <div className="page-container">
      <div>
        <h1 className="text-lg font-semibold text-white">Orders</h1>
        <p className="text-xs text-gray-500 mt-0.5">{filtered.length} orders</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`section-card px-3 py-2.5 text-left transition-all hover:border-gray-700 ${statusFilter === s ? "border-indigo-500/50 bg-indigo-600/5" : ""}`}>
            <p className="text-lg font-bold text-white">{counts[s]}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or ID…" className="input-field pl-9 h-9 text-sm w-full" />
      </div>

      <div className="section-card">
        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" description="Try adjusting your search or filter" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginated.map((o) => (
                    <tr key={o.id}>
                      <td className="font-mono text-indigo-400 font-semibold">#{o.id}</td>
                      <td>
                        <p className="text-sm font-medium text-gray-200">{o.customer}</p>
                        {o.email && <p className="text-xs text-gray-500">{o.email}</p>}
                      </td>
                      <td className="text-gray-500 text-xs">{o.date}</td>
                      <td className="text-gray-400">{o.items} item{o.items !== 1 ? "s" : ""}</td>
                      <td className="font-semibold text-white">${Number(o.total).toFixed(2)}</td>
                      <td><Badge status={o.status.toLowerCase()}>{o.status}</Badge></td>
                      <td>
                        <button onClick={() => setViewOrder(o)}
                          className="p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-indigo-400 transition-colors">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
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
