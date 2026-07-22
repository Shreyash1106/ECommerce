import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw, Package, Clock, CheckCircle2, AlertCircle, FileText,
  Printer, Download, ArrowLeft, ShieldCheck, Truck, Sparkles, Plus
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";

const REASONS = [
  "Wrong Product Received",
  "Damaged Product",
  "Missing Item / Parts",
  "Defective Product",
  "Quality Issue / Not as Expected",
  "Other",
];

const INITIAL_RETURNS = [
  {
    id: 1,
    return_id: "RET-9840182",
    order_id: 104,
    product_name: "Wireless Noise Cancelling Headphones",
    reason: "Defective Product",
    comments: "Left earbud stopped producing audio after 2 days of usage.",
    status: "Warehouse Inspection",
    refund_amount: 299.99,
    refund_txn_id: "TXN-REF-98401",
    refund_receipt: "REC-REF-98401",
    created_at: "Jul 20, 2026",
    timeline: [
      { step: "Return Requested", date: "Jul 20, 2026", completed: true },
      { step: "Vendor Approved", date: "Jul 21, 2026", completed: true },
      { step: "Pickup Scheduled", date: "Jul 21, 2026", completed: true },
      { step: "Picked Up", date: "Jul 22, 2026", completed: true },
      { step: "Warehouse Inspection", date: "In Progress", completed: false },
      { step: "Refund Approved", date: "Pending", completed: false },
      { step: "Refund Completed", date: "Pending", completed: false },
    ],
  },
];

export default function ReturnsPage() {
  const [returnsList, setReturnsList] = useState(INITIAL_RETURNS);
  const [requestOpen, setRequestOpen] = useState(false);
  const [timelineTarget, setTimelineTarget] = useState(null);
  const [receiptTarget, setReceiptTarget] = useState(null);

  const [orderId, setOrderId] = useState("108");
  const [reason, setReason] = useState(REASONS[0]);
  const [comments, setComments] = useState("");

  const handleCreateReturn = (e) => {
    e.preventDefault();
    const newReturn = {
      id: returnsList.length + 1,
      return_id: `RET-${Math.floor(1000000 + Math.random() * 9000000)}`,
      order_id: parseInt(orderId) || 108,
      product_name: "Smart Fitness Watch Series 9",
      reason: reason,
      comments: comments || "Customer return request",
      status: "Return Requested",
      refund_amount: 199.50,
      refund_txn_id: `TXN-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      refund_receipt: `REC-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeline: [
        { step: "Return Requested", date: "Today", completed: true },
        { step: "Vendor Review", date: "In Progress", completed: false },
        { step: "Pickup Scheduled", date: "Pending", completed: false },
        { step: "Picked Up", date: "Pending", completed: false },
        { step: "Warehouse Inspection", date: "Pending", completed: false },
        { step: "Refund Approved", date: "Pending", completed: false },
        { step: "Refund Completed", date: "Pending", completed: false },
      ],
    };

    setReturnsList((prev) => [newReturn, ...prev]);
    setRequestOpen(false);
    setComments("");
    toast.success("Return request submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Returns & Refunds Center</h1>
            <p className="text-xs text-slate-500 mt-1">Track return requests, view warehouse inspection steps, and download refund receipts.</p>
          </div>

          <Button
            variant="amber"
            size="md"
            onClick={() => setRequestOpen(true)}
            icon={Plus}
            className="text-xs font-black"
          >
            Request New Return
          </Button>
        </div>

        {/* Returns List */}
        {returnsList.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-12 shadow-sm">
            <EmptyState
              icon={RotateCcw}
              title="No Return Requests Found"
              description="You have no active or completed return requests at this time."
              action={<Link to="/orders" className="btn-primary text-xs font-bold px-6 py-3">View Delivered Orders</Link>}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {returnsList.map((ret) => (
              <div key={ret.id} className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-blue-600">#{ret.return_id}</span>
                    <span className="text-xs text-slate-400 font-semibold">•</span>
                    <span className="text-xs text-slate-500 font-semibold">Order #{ret.order_id}</span>
                    <span className="text-xs text-slate-400 font-semibold">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{ret.created_at}</span>
                  </div>
                  <Badge status="pending">{ret.status}</Badge>
                </div>

                {/* Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{ret.product_name}</h3>
                    <p className="text-xs text-rose-600 font-bold mt-0.5">Reason: {ret.reason}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{ret.comments}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-500 block">Refund Value</span>
                    <span className="text-xl font-black text-emerald-600">${Number(ret.refund_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTimelineTarget(ret)}
                    icon={Truck}
                    className="text-xs font-bold"
                  >
                    View 7-Step Timeline
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReceiptTarget(ret)}
                    icon={FileText}
                    className="text-xs font-bold"
                  >
                    Refund Receipt
                  </Button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Submit Return Request Modal */}
      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Submit Return Request" size="md">
        <form onSubmit={handleCreateReturn} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Delivered Order ID *</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 104"
              className="input-field font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Return *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-field">
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Comments & Details</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe the issue with the item…"
              className="input-field resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button type="submit" variant="amber" size="sm" className="font-black">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* 7-Step Amazon Return Timeline Modal */}
      <Modal open={!!timelineTarget} onClose={() => setTimelineTarget(null)} title={`Return Progress — #${timelineTarget?.return_id}`} size="lg">
        {timelineTarget && (
          <div className="space-y-6 font-sans p-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-500">Refund Amount</p>
                <p className="text-lg font-black text-emerald-600">${Number(timelineTarget.refund_amount).toFixed(2)}</p>
              </div>
              <div className="text-right font-mono">
                <p className="font-bold text-slate-900">Txn: {timelineTarget.refund_txn_id}</p>
                <p className="text-slate-500">Method: Original Card</p>
              </div>
            </div>

            {/* 7-Step Timeline */}
            <div className="space-y-5 relative pl-6 border-l-2 border-slate-200 ml-4 text-xs">
              {timelineTarget.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.completed
                        ? "bg-emerald-500 text-white"
                        : idx === 4
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.completed ? "✓" : idx + 1}
                  </div>
                  <div>
                    <h4 className={`font-extrabold ${step.completed ? "text-slate-900" : "text-slate-500"}`}>{step.step}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Status: {step.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setTimelineTarget(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Refund Receipt Modal */}
      <Modal open={!!receiptTarget} onClose={() => setReceiptTarget(null)} title={`Refund Receipt — #${receiptTarget?.refund_receipt}`} size="lg">
        {receiptTarget && (
          <div className="space-y-6 font-sans p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="flex justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">CommerceOS Inc.</h2>
                <p className="text-xs text-slate-500">Official Credit Refund Receipt</p>
              </div>
              <div className="text-right font-mono text-xs">
                <p className="font-bold text-slate-900">Receipt: #{receiptTarget.refund_receipt}</p>
                <p className="text-slate-500">Date: {receiptTarget.created_at}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-500 mb-1">Original Order:</p>
                <p className="font-extrabold text-slate-900">Order #{receiptTarget.order_id}</p>
                <p className="text-slate-500">Refund Txn: {receiptTarget.refund_txn_id}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-500 mb-1">Refund Method:</p>
                <p className="font-extrabold text-slate-900">Original Payment Source</p>
                <p className="text-emerald-600 font-bold">Status: Processed</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Product Returned:</span>
                <span className="font-bold text-slate-900">{receiptTarget.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Reason:</span>
                <span className="font-bold text-slate-900">{receiptTarget.reason}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Refund Amount:</span>
                <span className="text-emerald-600">${Number(receiptTarget.refund_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={Printer}>Print / Save PDF</Button>
              <Button variant="primary" size="sm" onClick={() => setReceiptTarget(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
