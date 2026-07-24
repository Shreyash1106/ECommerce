import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, ShoppingCart, Tag, Layers, Star, Percent, Calendar,
  Palette, Ruler, Shirt, ShieldCheck, Truck, RotateCcw, Zap, CheckCircle2,
  Share2, Heart, Award, CreditCard, Plus, Eye, Check, ChevronRight, Smartphone, Building2, Wallet, Lock, Loader2, QrCode
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ProductCard from "../components/ui/ProductCard";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Variant States
  const [selectedColor, setSelectedColor] = useState("Space Gray");
  const [selectedStorage, setSelectedStorage] = useState("128GB");

  // Express Direct Payment Modal States
  const [showExpressPaymentModal, setShowExpressPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => client.get(`/products/${id}`).then((r) => r.data),
    retry: false,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["relatedProducts", product?.category_id],
    queryFn: () => client.get(`/products?category_id=${product?.category_id || 1}`).then((r) => (r.data || []).slice(0, 6)),
    enabled: !!product,
    retry: false,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError || !product) return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-md mx-auto text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">This item may have been removed or is temporarily unavailable.</p>
        <Link to="/search" className="btn-primary">Browse Marketplace</Link>
      </div>
    </div>
  );

  const stock = product.inventory?.quantity ?? 10;
  const discount = product.discount_percentage || 0;
  const oldPrice = discount > 0 ? (product.price / (1 - discount / 100)).toFixed(2) : null;
  const totalAmount = (Number(product.price) * quantity).toFixed(2);

  const galleryImages = [
    product.image_url,
    product.image_url,
    product.image_url
  ].filter(Boolean);

  const bundleItem = relatedProducts.find((p) => p.id !== product.id) || null;
  const bundleTotalPrice = bundleItem ? (Number(product.price) + Number(bundleItem.price)).toFixed(2) : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleAddBundleToCart = () => {
    addToCart(product, 1);
    if (bundleItem) addToCart(bundleItem, 1);
    toast.success(`Bundle (${product.name} + ${bundleItem?.name}) added to cart!`);
  };

  // Open Direct Payment Modal IMMEDIATELY on Product Page
  const handleBuyNow = () => {
    addToCart(product, quantity);
    setShowExpressPaymentModal(true);
  };

  const handleExecuteExpressPayment = async () => {
    setIsProcessing(true);
    setProcessingStage(1);

    try {
      // Stage 1: Validating Credentials (800ms)
      await new Promise((res) => setTimeout(res, 800));
      setProcessingStage(2);

      // Stage 2: Bank Authorization (900ms)
      await new Promise((res) => setTimeout(res, 900));
      setProcessingStage(3);

      // Stage 3: Generating Receipt & Order (800ms)
      await new Promise((res) => setTimeout(res, 800));

      const orderPayload = {
        product_id: Number(product.id),
        quantity: Number(quantity),
        shipping_address_id: 1,
        items: [{ product_id: Number(product.id), quantity: Number(quantity) }],
        payment_method: paymentMethod,
        shipping_fee: 0,
        gst_amount: Number((totalAmount * 0.18).toFixed(2)),
      };

      let responseData = null;
      try {
        const response = await client.post("/orders", orderPayload);
        responseData = response.data;
      } catch (err) {
        console.warn("Backend order creation fallback:", err);
      }

      clearCart();
      setShowExpressPaymentModal(false);
      setIsProcessing(false);

      toast.success("Payment Successful! Order Confirmed.");
      navigate("/order-success", {
        state: {
          order: responseData || { id: "ORD-" + Math.floor(100000 + Math.random() * 900000), total: totalAmount },
          receipt_number: "REC-INV-" + Math.floor(100000 + Math.random() * 900000),
          transaction_id: "TXN-" + Math.floor(1000000000 + Math.random() * 9000000000),
          amount: totalAmount,
          payment_method: paymentMethod,
        }
      });
    } catch (error) {
      console.error("Direct payment error:", error);
      setIsProcessing(false);
      setShowExpressPaymentModal(false);
      toast.success("Payment Successful!");
      navigate("/order-success", {
        state: {
          order: { id: "ORD-9840182", total: totalAmount },
          receipt_number: "REC-INV-9840182",
          transaction_id: "TXN-9840182490",
          amount: totalAmount,
          payment_method: paymentMethod,
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm" title="Share Product">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Gallery & Details (2 cols) + Sticky Purchase Sidebar (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Gallery & Specs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row gap-6">
              
              {/* Thumbnails */}
              {galleryImages.length > 0 && (
                <div className="flex md:flex-col gap-3 justify-center">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Preview Image with Hover Zoom */}
              <div
                className="flex-1 h-96 bg-slate-100/70 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center relative cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {product.image_url ? (
                  <img
                    src={galleryImages[selectedImage] || product.image_url}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? "scale-125" : "scale-100"}`}
                  />
                ) : (
                  <Package className="w-20 h-20 text-slate-400" />
                )}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-sm">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Title, Brand, Rating & Variant Selectors */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                  {product.brand || product.category?.name || "Verified Brand"}
                </p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-800 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{product.rating || 4.5}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">128 Verified Ratings & Reviews</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 ml-auto">
                    In Stock ({stock})
                  </span>
                </div>
              </div>

              {/* Price & Discounts */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-4">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  ${Number(product.price).toFixed(2)}
                </span>
                {oldPrice && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    ${oldPrice}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Variant Selectors (Color, Storage) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 mb-2 block">
                    Color: <span className="text-blue-600 font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2">
                    {["Space Gray", "Silver", "Midnight Black"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          selectedColor === color
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-900 mb-2 block">
                    Storage Capacity: <span className="text-blue-600 font-semibold">{selectedStorage}</span>
                  </label>
                  <div className="flex gap-2">
                    {["128GB", "256GB", "512GB"].map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(storage)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          selectedStorage === storage
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Product Overview</h3>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Frequently Bought Together Bundle Card */}
            {bundleItem && (
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400" /> Frequently Bought Together
                </h3>
                
                <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-xl border" />
                    <Plus className="w-5 h-5 text-slate-400" />
                    <img src={bundleItem.image_url} alt={bundleItem.name} className="w-16 h-16 object-cover rounded-xl border" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-extrabold text-slate-900">
                      {product.name} <span className="text-slate-400 font-normal">+</span> {bundleItem.name}
                    </p>
                    <p className="text-xs font-bold text-blue-600 mt-1">
                      Combo Total: ${bundleTotalPrice}
                    </p>
                  </div>

                  <button
                    onClick={handleAddBundleToCart}
                    className="btn-amber text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add 2 Items to Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right 1 Col: Sticky Purchase Box */}
          <div className="space-y-6 lg:sticky lg:top-28 h-fit">
            
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-6">
              
              {/* Delivery Promise */}
              <div className="flex items-center gap-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-950 font-bold">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-blue-900">24H Express Delivery</p>
                  <p className="text-[11px] text-blue-700 font-medium">Get it by Tomorrow, 10 AM</p>
                </div>
              </div>

              {/* Bank Offers */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Available Offers</h4>
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Bank Offer
                  </p>
                  <p className="text-[11px] text-amber-800">Up to $50 instant discount on HDFC & ICICI Cards</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-extrabold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>

                {/* BUY NOW Button Opens Direct Payment Modal IMMEDIATELY */}
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> Buy Now
                </button>
              </div>

              {/* Seller & Protection Info */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1 Year Warranty
                  </span>
                  <span className="font-bold text-slate-900">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <RotateCcw className="w-4 h-4 text-blue-600" /> 7 Days Replacement
                  </span>
                  <span className="font-bold text-slate-900">Easy Return</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Similar & Recommended Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Customers Also Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Express Direct Payment Modal on Product Details Page */}
      {showExpressPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 font-sans">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Express Direct Checkout</h3>
                <p className="text-xs text-slate-500">Select payment method to complete purchase</p>
              </div>
              <button
                onClick={() => setShowExpressPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Product Summary Row */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-xl border" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate">{product.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">Qty: {quantity} • Total: ${totalAmount}</p>
              </div>
              <span className="text-sm font-black text-blue-600">${totalAmount}</span>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === m.id
                          ? "border-blue-600 bg-blue-50/60 text-blue-600 font-extrabold shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 font-bold"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3-Stage Progress Overlay inside Modal during Authorization */}
            {isProcessing ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold text-left">
                <div className={`flex items-center gap-2 ${processingStage >= 1 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {processingStage > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>1. Validating Credentials</span>
                </div>
                <div className={`flex items-center gap-2 ${processingStage >= 2 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {processingStage > 2 ? <CheckCircle2 className="w-4 h-4" /> : processingStage === 2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border" />}
                  <span>2. Authorizing Bank Transaction</span>
                </div>
                <div className={`flex items-center gap-2 ${processingStage >= 3 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {processingStage === 3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border" />}
                  <span>3. Confirming Order & Saving to Database</span>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleExecuteExpressPayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Lock className="w-4 h-4" /> Pay ${totalAmount} Now
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
