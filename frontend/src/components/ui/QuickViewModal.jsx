import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Star, ShoppingCart, Zap, Package, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

export default function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discount = product.discount_percentage || 0;
  const oldPrice = discount > 0 ? (product.price / (1 - discount / 100)).toFixed(2) : null;
  const stock = product.inventory?.quantity ?? 10;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Image */}
          <div className="h-64 md:h-80 bg-slate-100/80 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-16 h-16 text-slate-400" />
            )}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                {product.brand || product.category?.name || "Product"}
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{product.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">{product.rating || 4.5} / 5.0</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                In Stock ({stock})
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">${Number(product.price).toFixed(2)}</span>
              {oldPrice && <span className="text-sm font-semibold text-slate-400 line-through">${oldPrice}</span>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-slate-600 font-bold hover:bg-slate-200"
                >−</button>
                <span className="px-4 py-1 font-extrabold text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  className="px-3 py-1 text-slate-600 font-bold hover:bg-slate-200"
                >+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleAddToCart}
                className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-amber py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-slate-950" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
