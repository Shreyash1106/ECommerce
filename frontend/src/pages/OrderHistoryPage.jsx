import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package, Search, Eye, ShoppingCart, Truck, CheckCircle2, Clock,
  Calendar, FileText, Download, RotateCcw, ArrowLeft, ShieldCheck, MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

const TRACKING_STEPS = [
  { status: "Pending", title: "Order Placed", desc: "We have received your order." },
  { status: "Processing", title: "Order Confirmed & Packed", desc: "Merchant is preparing items for dispatch." },
  { status: "Shipped", title: "Shipped", desc: "Package handed over to logistics carrier." },
  { status: "Out For Delivery", title: "Out For Delivery", desc: "Courier partner is delivering to your address." },
  { status: "Delivered", title: "Delivered", desc: "Package delivered safely." },
];

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { addToCart } = useStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackOrder, setTrackOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const { data: rawOrders = [], isLoading, isError } = useQuery({
    queryKey: ["customerOrders"],
    queryFn: () => client.get("/orders").then((r) => (Array.isArray(r.data) ? r.data : [])),
    retry: 1,
  });

  const orders = useMemo(() => {
    return rawOrders.map((o) => ({
      id: o.id,
      product_id: o.product_id,
      product_name: o.product_name || `Product #${o.product_id}`,
      date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "Jul 22, 2026",
      quantity: o.quantity || 1,
      total_price: o.total_price || 0,
      status: o.status || "Processing",
      receipt_number: `REC-INV-${o.id}8472`,
      transaction_id: `TXN-${o.id}91823`,
    }));
  }, [rawOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = String(o.id).includes(search) || o.product_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleReorder = (order) => {
    addToCart({ id: order.product_id, name: order.product_name, price: order.total_price / order.quantity }, order.quantity);
    toast.success(`Added ${order.product_name} to cart!`);
    navigate("/cart");
  };

  const getStepStatus = (stepStatus, currentStatus) => {
    const statusOrder = ["Pending", "Processing", "Shipped", "Out For Delivery", "Delivered"];
    const stepIdx = statusOrder.indexOf(stepStatus);
    const currIdx = statusOrder.indexOf(currentStatus);

    if (currIdx >= stepIdx) return "completed";
    if (currIdx + 1 === stepIdx) return "active";
    return "pending";
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link to="/home" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Order History</h1>
            <p className="text-xs text-slate-500 mt-1">Track shipments, download invoices, and reorder past purchases.</p>
          </div>
          <span className="px-4 py-2 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-2xl border border-blue-200 self-start sm:self-auto">
            {filteredOrders.length} Total Orders Placed
          </span>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or products…"
              className="input-field pl-10 text-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {["All", "Pending", "Processing", "Shipped", "Delivered"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  statusFilter === s
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-12 shadow-sm">
            <EmptyState
              icon={Package}
              title="No Orders Found"
              description="You have not placed any orders matching your search parameters yet."
              action={<Link to="/search" className="btn-primary text-xs font-bold px-6 py-3">Start Shopping</Link>}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-extrabold text-blue-600">Order #{order.id}</span>
                    <span className="text-xs text-slate-400 font-semibold">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{order.date}</span>
                  </div>
                  <Badge status={order.status.toLowerCase()}>{order.status}</Badge>
                </div>

                {/* Main Product Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{order.product_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {order.quantity} | Total: ${Number(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-500 block">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTrackOrder(order)}
                    icon={Truck}
                    className="text-xs font-bold"
                  >
                    Track Package
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInvoiceOrder(order)}
                    icon={FileText}
                    className="text-xs font-bold"
                  >
                    Download Invoice
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => navigate("/returns")}
                    icon={RotateCcw}
                    className="text-xs font-bold"
                  >
                    Return Item
                  </Button>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => handleReorder(order)}
                    icon={RotateCcw}
                    className="text-xs font-black"
                  >
                    Buy Again
                  </Button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Amazon-Style Track Package Modal */}
      <Modal open={!!trackOrder} onClose={() => setTrackOrder(null)} title={`Shipment Tracking — Order #${trackOrder?.id}`} size="lg">
        {trackOrder && (
          <div className="space-y-6 font-sans p-2">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="text-xs font-bold text-slate-500">Carrier Partner</p>
                <p className="text-sm font-extrabold text-slate-900">CommerceOS Express Freight</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Tracking Code</p>
                <p className="text-sm font-mono font-bold text-blue-600">TRK-9847192847</p>
              </div>
            </div>

            {/* Step Progress Timeline */}
            <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-4">
              {TRACKING_STEPS.map((step, idx) => {
                const statusState = getStepStatus(step.status, trackOrder.status);
                return (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        statusState === "completed"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : statusState === "active"
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {statusState === "completed" ? "✓" : idx + 1}
                    </div>

                    <div>
                      <h4 className={`text-sm font-extrabold ${statusState !== "pending" ? "text-slate-900" : "text-slate-400"}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setTrackOrder(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Preview Modal */}
      <Modal open={!!invoiceOrder} onClose={() => setInvoiceOrder(null)} title={`Tax Invoice — #${invoiceOrder?.receipt_number}`} size="lg">
        {invoiceOrder && (
          <div className="space-y-6 font-sans p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="flex justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">CommerceOS Inc.</h2>
                <p className="text-xs text-slate-500">Official Marketplace Receipt & Tax Invoice</p>
              </div>
              <div className="text-right font-mono text-xs">
                <p className="font-bold text-slate-900">Invoice: #{invoiceOrder.receipt_number}</p>
                <p className="text-slate-500">Date: {invoiceOrder.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-500 mb-1">Customer Info:</p>
                <p className="font-extrabold text-slate-900">Valued Customer</p>
                <p className="text-slate-500">Payment: {invoiceOrder.transaction_id}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-500 mb-1">Merchant Info:</p>
                <p className="font-extrabold text-slate-900">Official Brand Partner</p>
                <p className="text-slate-500">GST Registration: 27AAAAA0000A1Z5</p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-bold text-slate-700">Item</th>
                  <th className="p-3 font-bold text-slate-700 text-center">Qty</th>
                  <th className="p-3 font-bold text-slate-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-900">{invoiceOrder.product_name}</td>
                  <td className="p-3 text-center">{invoiceOrder.quantity}</td>
                  <td className="p-3 text-right font-bold">${Number(invoiceOrder.total_price).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={Download}>Print / Save PDF</Button>
              <Button variant="primary" size="sm" onClick={() => setInvoiceOrder(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
