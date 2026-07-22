import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Tag, ArrowRight, Package } from "lucide-react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart = [], removeFromCart, updateQuantity, clearCart } = useStore();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 5.99;
  const gst = subtotal * 0.18; // 18% GST/Tax
  const grandTotal = Math.max(0, subtotal + shipping + gst - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "SAVE10") {
      const disc = subtotal * 0.10;
      setDiscountAmount(disc);
      toast.success("Coupon SAVE10 applied! (10% OFF)");
    } else if (couponCode.trim().toUpperCase() === "PROMO20") {
      const disc = subtotal * 0.20;
      setDiscountAmount(disc);
      toast.success("Coupon PROMO20 applied! (20% OFF)");
    } else {
      toast.error("Invalid coupon code. Try SAVE10 or PROMO20");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto text-center bg-white border border-slate-200/80 rounded-3xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
            Looks like you haven't added any products to your cart yet. Explore our top deals and start shopping!
          </p>
          <Link to="/search" className="btn-primary">
            Explore Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/search" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">{cart.length} item(s) in your cart</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your cart?")) {
                clearCart();
                toast.success("Cart cleared");
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl self-start transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemTotal = Number(item.price) * (item.quantity || 1);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all hover:shadow-md"
                >
                  <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{item.brand || "Item"}</p>
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    <p className="text-sm font-extrabold text-slate-900 pt-1">${Number(item.price).toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200"
                      >−</button>
                      <span className="px-3 py-1.5 font-extrabold text-sm text-slate-900">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200"
                      >+</button>
                    </div>

                    <p className="text-base font-black text-slate-900 min-w-[4rem] text-right">
                      ${itemTotal.toFixed(2)}
                    </p>

                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success("Item removed from cart");
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Summary & Coupon Sidebar (1 col) */}
          <div className="space-y-6">
            
            {/* Promo Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" /> Have a Coupon Code?
              </h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10 or PROMO20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors">
                  Apply
                </button>
              </form>
            </div>

            {/* Price Summary Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Estimated GST / Tax (18%)</span>
                  <span className="font-bold text-slate-900">${gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-900">{shipping === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Coupon Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full btn-amber py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 mt-4"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Encrypted & Safe Checkout
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
