import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2, MapPin, Truck, CreditCard, ShieldCheck,
  Package, ArrowLeft, ArrowRight, ChevronRight, Zap, Tag, AlertCircle, Percent, Lock, Loader2,
  QrCode, Building2, Wallet, Check, DollarSign, Smartphone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

const NET_BANKS = [
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "icici", name: "ICICI Bank", logo: "🏛️" },
  { id: "sbi", name: "State Bank of India", logo: "🏦" },
  { id: "axis", name: "Axis Bank", logo: "🏛️" },
  { id: "kotak", name: "Kotak Mahindra", logo: "🏦" },
];

const WALLETS = [
  { id: "amazon_pay", name: "Amazon Pay", balance: "$250.00", icon: "🛒" },
  { id: "paytm", name: "Paytm Wallet", balance: "$180.00", icon: "📱" },
  { id: "phonepe", name: "PhonePe Wallet", balance: "$320.00", icon: "⚡" },
  { id: "mobikwik", name: "MobiKwik", balance: "$95.00", icon: "💳" },
];

function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [], clearCart } = useStore();

  // Jump to step specified in state (default to Step 3 Payment if coming from Buy Now)
  const initialStep = location.state?.step !== undefined ? location.state.step : 3;
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Card Form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UPI Form
  const [upiOption, setUpiOption] = useState("id");
  const [upiId, setUpiId] = useState("");

  // NetBanking & Wallet Form
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [selectedWallet, setSelectedWallet] = useState("amazon_pay");
  const [codNote, setCodNote] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Payment Processing Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);

  // Fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: addressApi.fetchAddresses,
  });

  // Auto-select fallback address
  useEffect(() => {
    if (!selectedAddress) {
      if (addresses && addresses.length > 0) {
        setSelectedAddress(addresses[0]);
      } else {
        setSelectedAddress({
          id: 1,
          full_name: "Default Customer",
          address_line1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        });
      }
    }
  }, [addresses]);

  // Card Brand Detection
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5")) return "Mastercard";
    if (clean.startsWith("6")) return "RuPay";
    if (clean.startsWith("3")) return "American Express";
    return null;
  }, [cardNumber]);

  // Calculate pricing
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0), [cart]);

  const discount = useMemo(() => {
    if (appliedCoupon === "SAVE10") return subtotal * 0.10;
    if (appliedCoupon === "PROMO20") return subtotal * 0.20;
    return 0;
  }, [subtotal, appliedCoupon]);

  const shippingFee = deliveryMethod === "express" ? 15.00 : (subtotal >= 100 || subtotal === 0 ? 0 : 9.99);
  const gst = roundToTwo((subtotal - discount) * 0.18);
  const grandTotal = useMemo(() => roundToTwo(subtotal - discount + shippingFee + gst), [subtotal, discount, shippingFee, gst]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE10" || code === "PROMO20") {
      setAppliedCoupon(code);
      toast.success(`Coupon ${code} applied successfully!`);
    } else {
      toast.error("Invalid Promo Code. Try SAVE10 or PROMO20");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed.");
  };

  const handleCompletePayment = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const targetAddress = selectedAddress || addresses[0] || { id: 1 };
    const firstItem = cart[0] || { id: 1, quantity: 1 };

    setIsProcessing(true);
    setShowProcessingModal(true);
    setProcessingStage(1);

    try {
      // Stage 1: Validating Credentials (800ms)
      await new Promise((res) => setTimeout(res, 800));
      setProcessingStage(2);

      // Stage 2: Bank Authorization (900ms)
      await new Promise((res) => setTimeout(res, 900));
      setProcessingStage(3);

      // Stage 3: Generating Receipt & Order Details (800ms)
      await new Promise((res) => setTimeout(res, 800));

      const orderPayload = {
        product_id: Number(firstItem.id),
        quantity: Number(firstItem.quantity || 1),
        shipping_address_id: targetAddress.id || 1,
        items: cart.map((i) => ({ product_id: Number(i.id), quantity: Number(i.quantity || 1) })),
        payment_method: paymentMethod,
        coupon_code: appliedCoupon,
        shipping_fee: shippingFee,
        gst_amount: gst,
      };

      const response = await client.post("/orders", orderPayload);
      clearCart();
      setShowProcessingModal(false);
      setIsProcessing(false);

      toast.success("Payment Authorized & Order Placed Successfully!");
      navigate("/order-success", {
        state: {
          order: response.data || { id: "ORD-9840182", total: grandTotal },
          receipt_number: "REC-INV-9840182",
          transaction_id: "TXN-9840182490",
          amount: grandTotal,
          payment_method: paymentMethod,
        }
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      setShowProcessingModal(false);
      setIsProcessing(false);
      toast.error(error?.response?.data?.detail || "Order processing failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted Payment Gateway
          </div>
        </div>

        {/* 5-Step Progress Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5 text-white" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-extrabold hidden md:inline ${
                      currentStep >= step.id ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > idx + 1 ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Grid: Steps (2 cols) & Summary (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Select Shipping Address</h2>
                
                {addresses.length === 0 ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-medium">
                    Default Address Selected: 123 Main Street, Mumbai, Maharashtra - 400001
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                          selectedAddress?.id === addr.id
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{addr.full_name}</span>
                          {selectedAddress?.id === addr.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentStep(2)}
                  >
                    Next: Delivery Method
                  </Button>
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
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      deliveryMethod === "standard" ? "border-blue-600 bg-blue-50/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-slate-700" />
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Standard Delivery (3-5 Days)</p>
                        <p className="text-xs text-slate-500">Free shipping on orders over $100</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">FREE</span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod("express")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
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

            {/* Step 3: Production Fake Payment Gateway UI */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-xl font-extrabold text-slate-900">Select Payment Method</h2>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">MockPay Gateway</span>
                </div>
                
                {/* 5 Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                    { id: "upi", label: "Instant UPI", icon: Smartphone },
                    { id: "netbanking", label: "Net Banking", icon: Building2 },
                    { id: "wallet", label: "Wallet", icon: Wallet },
                    { id: "cod", label: "Cash on Delivery", icon: Package },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === m.id
                            ? "border-blue-600 bg-blue-50/60 text-blue-600 font-extrabold shadow-sm"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 font-bold"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 1. Credit / Debit Card Dedicated Form */}
                {paymentMethod === "card" && (
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Card Details</h3>
                      {cardBrand && (
                        <span className="text-xs font-black px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
                          {cardBrand}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8901"
                        maxLength={19}
                        className="input-field text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="input-field text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="input-field text-xs text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="input-field text-xs text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Instant UPI Dedicated Form */}
                {paymentMethod === "upi" && (
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                    <div className="flex gap-4 border-b border-slate-200 pb-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="upi_opt"
                          checked={upiOption === "id"}
                          onChange={() => setUpiOption("id")}
                        />
                        Enter VPA / UPI ID
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="upi_opt"
                          checked={upiOption === "qr"}
                          onChange={() => setUpiOption("qr")}
                        />
                        Scan QR Code
                      </label>
                    </div>

                    {upiOption === "id" ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okaxis / username@ybl"
                          className="input-field text-xs"
                        />
                        <p className="text-[11px] text-slate-500">Supports Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                        <div className="w-36 h-36 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white p-3 shadow-md">
                          <QrCode className="w-28 h-28" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-900">Scan with any UPI App to Pay ${grandTotal.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Net Banking Dedicated Selector */}
                {paymentMethod === "netbanking" && (
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Popular Banks</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {NET_BANKS.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                            selectedBank === b.id ? "border-blue-600 bg-white shadow-sm" : "border-slate-200 bg-white/70"
                          }`}
                        >
                          <span className="text-2xl">{b.logo}</span>
                          <span className="text-xs font-bold text-slate-900">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Digital Wallet Selector */}
                {paymentMethod === "wallet" && (
                  <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Select Digital Wallet</h3>
                    <div className="space-y-2">
                      {WALLETS.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => setSelectedWallet(w.id)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                            selectedWallet === w.id ? "border-blue-600 bg-white shadow-sm" : "border-slate-200 bg-white/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{w.icon}</span>
                            <span className="text-xs font-extrabold text-slate-900">{w.name}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                            Balance: {w.balance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Cash on Delivery (COD) Confirmation Box */}
                {paymentMethod === "cod" && (
                  <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-amber-950">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                      <Package className="w-5 h-5 text-amber-600" /> Cash on Delivery Confirmed
                    </div>
                    <p className="text-xs leading-relaxed text-amber-800">
                      Pay <span className="font-bold text-slate-900">${grandTotal.toFixed(2)}</span> via Cash or UPI QR code to the delivery partner upon arrival.
                    </p>
                    <input
                      type="text"
                      value={codNote}
                      onChange={(e) => setCodNote(e.target.value)}
                      placeholder="Optional Delivery Instructions (e.g. Call before arrival)"
                      className="input-field text-xs bg-white"
                    />
                  </div>
                )}

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

      {/* Production-like 3-Stage Payment Processing Overlay Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto relative shadow-inner">
              <Loader2 className="w-10 h-10 animate-spin" />
              <Lock className="w-5 h-5 absolute text-blue-700" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Authorizing Payment</h3>
              <p className="text-xs text-slate-500 mt-1">Connecting to MockPay Enterprise Payment Gateway...</p>
            </div>

            {/* 3-Step Live Progress Steps */}
            <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold">
              <div className={`flex items-center gap-2 ${processingStage >= 1 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                {processingStage > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span>1. Validating Credentials & Payment Method</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStage >= 2 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                {processingStage > 2 ? <CheckCircle2 className="w-4 h-4" /> : processingStage === 2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border" />}
                <span>2. Authorizing Bank Transaction</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStage >= 3 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                {processingStage === 3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border" />}
                <span>3. Generating Receipt, Tax Invoice & Decrementing Inventory</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950 font-mono">
              <div className="flex justify-between"><span>Payment ID:</span> <span className="font-extrabold text-blue-900">PAY-9840182</span></div>
              <div className="flex justify-between"><span>Txn ID:</span> <span className="font-extrabold text-blue-900">TXN-9840182</span></div>
              <div className="flex justify-between"><span>Method:</span> <span className="font-extrabold uppercase text-blue-900">{paymentMethod}</span></div>
              <div className="flex justify-between"><span>Amount:</span> <span className="font-black text-emerald-600">${grandTotal.toFixed(2)}</span></div>
            </div>

            <p className="text-[11px] text-slate-400">Please do not refresh or close this window...</p>
          </div>
        </div>
      )}
    </div>
  );
}
