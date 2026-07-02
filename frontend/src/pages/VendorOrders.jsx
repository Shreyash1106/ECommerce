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
    <div className="page-container">
      <div>
        <h1 className="text-lg font-semibold text-white">My Orders</h1>
        <p className="text-xs text-gray-500 mt-0.5">{filtered.length} orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-indigo-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search…"
          className="input-field pl-9 h-9 text-sm w-full"
        />
      </div>

      <div className="section-card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={totalOrders === 0 ? "No orders have been placed yet." : "No orders match your filter."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
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
                      <td className="text-gray-300 text-xs">{o.product_name}</td>
                      <td className="text-gray-500 text-xs">{o.date}</td>
                      <td className="text-gray-400">{o.items}</td>
                      <td className="font-semibold text-white">${Number(o.total).toFixed(2)}</td>
                      <td><Badge status={o.status.toLowerCase()}>{o.status}</Badge></td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => statusMutation.mutate({ orderId: o.id, status: e.target.value })}
                          className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1"
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
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
