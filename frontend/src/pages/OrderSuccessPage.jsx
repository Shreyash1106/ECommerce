import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, ArrowRight, Printer, ShieldCheck, Package } from "lucide-react";
import Button from "../components/ui/Button";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const receiptNumber = state.receipt_number || "REC-INV-849201";
  const transactionId = state.transaction_id || "TXN-9847192847";
  const amount = state.amount || 299.99;
  const paymentMethod = state.payment_method || "Credit Card";
  const orderId = state.order_id || 104;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-slate-200/80 rounded-[32px] p-8 md:p-10 shadow-xl text-center space-y-6">
        
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-xs text-slate-500 mt-1">Thank you for your purchase. Your order has been placed and is being prepared.</p>
        </div>

        {/* Receipt Details Card */}
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
            <span className="font-bold text-slate-500">Payment Method:</span>
            <span className="font-bold text-slate-900">{paymentMethod}</span>
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
            onClick={() => window.print()}
            icon={Printer}
            className="w-full text-xs font-bold"
          >
            Print Receipt
          </Button>
          <Button
            variant="amber"
            size="md"
            onClick={() => navigate("/orders")}
            icon={Package}
            className="w-full text-xs font-black"
          >
            Track Order
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link to="/home" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            Continue Shopping Marketplace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
