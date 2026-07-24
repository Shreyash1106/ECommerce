import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, ArrowRight, Printer, ShieldCheck, Package, Download, Sparkles } from "lucide-react";
import Button from "../components/ui/Button";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const order = state.order || {};
  const orderId = order.id || state.order_id || "ORD-9840182";
  const receiptNumber = state.receipt_number || order.receipt_number || "REC-INV-9840182";
  const transactionId = state.transaction_id || order.transaction_id || "TXN-9840182490";
  const amount = order.total || state.amount || 299.99;
  const paymentMethod = state.payment_method || order.payment_method || "Credit Card";

  const [showReceiptModal, setShowReceiptModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-slate-200/80 rounded-[32px] p-8 md:p-10 shadow-xl text-center space-y-6">
        
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> PAYMENT AUTHORIZED
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-xs text-slate-500 mt-1">Thank you for your purchase. Your order has been registered in our database.</p>
        </div>

        {/* Receipt Details Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-left space-y-3 font-sans text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-500">Order ID:</span>
            <span className="font-mono font-extrabold text-blue-600">#{orderId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-500">Receipt Number:</span>
            <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-500">Transaction ID:</span>
            <span className="font-mono font-bold text-slate-900">{transactionId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-500">Payment Gateway:</span>
            <span className="font-bold text-slate-900 uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm">
            <span className="font-black text-slate-900">Total Paid:</span>
            <span className="font-black text-emerald-600">${Number(amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowReceiptModal(true)}
            icon={Printer}
            className="w-full text-xs font-bold"
          >
            View & Print Receipt
          </Button>
          <Button
            variant="amber"
            size="md"
            onClick={() => navigate("/orders")}
            icon={Package}
            className="w-full text-xs font-black"
          >
            Track Order Progress
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link to="/home" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            Continue Shopping Marketplace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Official Printable Tax Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl font-sans text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">CommerceOS Marketplace</h2>
                <p className="text-[11px] text-slate-500">Official Tax Receipt & Invoice</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: 27AABCU9603R1ZM</p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-[11px]">
              <div className="flex justify-between"><span>Receipt No:</span> <span className="font-bold">{receiptNumber}</span></div>
              <div className="flex justify-between"><span>Order ID:</span> <span className="font-bold">#{orderId}</span></div>
              <div className="flex justify-between"><span>Transaction ID:</span> <span className="font-bold">{transactionId}</span></div>
              <div className="flex justify-between"><span>Payment Method:</span> <span className="font-bold uppercase">{paymentMethod}</span></div>
              <div className="flex justify-between text-emerald-700 font-bold border-t pt-1"><span>Payment Status:</span> <span>PAID (SUCCESS)</span></div>
            </div>

            <div className="flex justify-between items-center text-sm font-black border-t border-slate-200 pt-3">
              <span>Grand Total Amount</span>
              <span className="text-blue-600">${Number(amount).toFixed(2)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
