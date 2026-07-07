import React, { useState, useMemo } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAGE_SIZE = 6;

export default function VendorOrders() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage]                 = useState(1);
  const queryClient = useQueryClient();

  const { data: apiOrders, isLoading, isError, error } = useQuery({
    queryKey: ["vendorOrdersList"],
    queryFn: () => client.get("/orders").then((r) => Array.isArray(r.data) ? r.data : []),
    retry: 1,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      client.patch(`/orders/${orderId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendorOrdersList"] }),
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

  const totalOrders = (apiOrders || []).length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError) return (
    <div className="page-container">
      <EmptyState
        icon={ShoppingCart}
        title="Could not load orders"
        description={error?.response?.data?.detail || "Backend is offline or returned an error."}
      />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-10 px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} total orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              statusFilter === s 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.15)]" 
                : "bg-gray-900/40 backdrop-blur-md border-white/5 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10"
            }`}>
            {s}
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
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description={totalOrders === 0 ? "No orders have been placed yet." : "No orders match your filter."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Update</th>
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
                      <td className="px-6 py-4 text-gray-300 text-sm font-medium">{o.product_name}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm font-medium">{o.date}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{o.items}</td>
                      <td className="px-6 py-4 font-bold text-white">${Number(o.total).toFixed(2)}</td>
                      <td className="px-6 py-4"><Badge status={o.status.toLowerCase()}>{o.status}</Badge></td>
                      <td className="px-6 py-4">
                        <select
                          value={o.status}
                          onChange={(e) => statusMutation.mutate({ orderId: o.id, status: e.target.value })}
                          className="bg-gray-900/50 border border-white/10 text-gray-300 text-sm font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/50 transition-all hover:bg-white/5 cursor-pointer"
                        >
                          {STATUSES.filter((s) => s !== "All").map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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
    </div>
  );
}
