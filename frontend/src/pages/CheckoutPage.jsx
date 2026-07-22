import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2, MapPin, Truck, CreditCard, ShieldCheck,
  Package, ArrowLeft, ArrowRight, ChevronRight, Zap, Tag, AlertCircle, Percent
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addressApi } from "../api/addressApi";
import { useStore } from "../store/useStore";
import client from "../api/client";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, name: "Address" },
  { id: 2, name: "Delivery" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Review" },
  { id: 5, name: "Confirmation" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart = [], clearCart } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("standard"); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'cod'
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: addressApi.fetchAddresses,
  });

  // Calculate pricing
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0), [cart]);

  const discount = useMemo(() => {
    if (appliedCoupon === "SAVE10") return subtotal * 0.10;
    if (appliedCoupon === "PROMO20") return subtotal * 0.20;
    return 0;
  }, [subtotal, appliedCoupon]);

  const shippingFee = deliveryMethod === "express" ? 15.00 : (subtotal >= 100 || subtotal === 0 ? 0 : 9.99);
  const gst = roundToTwo((subtotal - discount) * 0.18);
  const grandTotal = Math.max(0, roundToTwo(subtotal - discount + shippingFee + gst));

  function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE10" || code === "PROMO20") {
      setAppliedCoupon(code);
      toast.success(`Coupon "${code}" applied!`);
    } else {
      toast.error("Invalid promo code. Try 'SAVE10' or 'PROMO20'");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Complete Payment Flow
  const handleCompletePayment = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Create Payment Intent
      const intentRes = await client.post("/payments/create", {
        amount: grandTotal,
        payment_method: paymentMethod.toUpperCase(),
        product_id: cart[0]?.id || 1,
        quantity: cart[0]?.quantity || 1,
      });

      const paymentData = intentRes.data?.data || {};

      // 2. Verify & Complete Payment
      const verifyRes = await client.post("/payments/verify", {
        payment_id: paymentData.payment_id,
        transaction_id: paymentData.transaction_id,
        status: "Success",
      });

      const verifyData = verifyRes.data?.data || {};

      clearCart();
      setIsProcessing(false);
      toast.success("Payment completed successfully!");

      navigate("/order-success", {
        state: {
          receipt_number: paymentData.receipt_number || "REC-INV-98402",
          transaction_id: paymentData.transaction_id || "TXN-849201",
          amount: grandTotal,
          payment_method: paymentMethod.toUpperCase(),
          order_id: verifyData.order_id || 108,
        },
      });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast.error("Payment failed. Please try again.");
    }
  };

  if (cart.length === 0 && currentStep < 5) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
        <div className="max-w-md mx-auto text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Add products to your cart before proceeding to checkout.</p>
          <Link to="/search" className="btn-primary text-xs font-bold px-6 py-3 inline-block">Browse Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* 5-Step Progress Indicator */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? "✓" : step.id}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                    {step.name}
                  </span>
                  {step.id < 5 && <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid (2 Cols: Form Step + 1 Col: Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Select Delivery Address</h2>
                {addresses.length === 0 ? (
                  <p className="text-xs text-slate-500">No saved addresses found. Please add an address in your Profile.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAddress?.id === addr.id
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-sm text-slate-900">{addr.full_name || "Primary Address"}</span>
                          {addr.is_default && <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">Default</span>}
                        </div>
                        <p className="text-xs text-slate-600">{addr.address_line_1}</p>
                        <p className="text-xs text-slate-500">{addr.city}, {addr.state} - {addr.postal_code}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button variant="primary" size="md" onClick={() => setCurrentStep(2)}>Next: Delivery Option</Button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Option */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Choose Delivery Speed</h2>
                <div className="space-y-3">
                  <div
                    onClick={() => setDeliveryMethod("standard")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === "standard" ? "border-blue-600 bg-blue-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Standard Delivery (3-5 Business Days)</p>
                        <p className="text-xs text-slate-500">Free shipping on orders over $100</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm">{subtotal >= 100 ? "FREE" : "$9.99"}</span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod("express")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === "express" ? "border-blue-600 bg-blue-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Express 24-Hour Delivery</p>
                        <p className="text-xs text-slate-500">Priority fulfillment & instant tracking</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm">$15.00</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button variant="primary" size="md" onClick={() => setCurrentStep(3)}>Next: Payment</Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Select Payment Gateway</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                    { id: "upi", label: "Instant UPI", icon: Zap },
                    { id: "cod", label: "Cash on Delivery", icon: Package },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer text-center space-y-2 transition-all ${
                          paymentMethod === m.id ? "border-blue-600 bg-blue-50/50" : "border-slate-200"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto text-slate-700" />
                        <p className="text-xs font-bold text-slate-900">{m.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(2)}>Back</Button>
                  <Button variant="primary" size="md" onClick={() => setCurrentStep(4)}>Next: Review Order</Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Review & Confirmation */}
            {currentStep === 4 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Review & Authorize Order</h2>
                
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchased Items ({cart.length})</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900">{item.name} (x{item.quantity || 1})</span>
                      <span className="font-black text-slate-900">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="secondary" size="md" onClick={() => setCurrentStep(3)}>Back</Button>
                  <Button
                    variant="amber"
                    size="md"
                    onClick={handleCompletePayment}
                    loading={isProcessing}
                    className="text-sm font-black"
                  >
                    Pay ${grandTotal.toFixed(2)} Now
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Order Price Summary</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code (SAVE10)"
                  className="input-field text-xs py-2 uppercase"
                />
                <Button type="submit" variant="secondary" size="sm" className="text-xs font-bold whitespace-nowrap">Apply</Button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                  <span>Applied: {appliedCoupon}</span>
                  <button onClick={handleRemoveCoupon} className="text-rose-600 hover:underline text-[11px]">Remove</button>
                </div>
              )}

              <div className="space-y-2.5 text-xs text-slate-600 font-semibold border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Coupon</span>
                    <span className="font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-slate-900">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18%)</span>
                  <span className="font-bold text-slate-900">${gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
