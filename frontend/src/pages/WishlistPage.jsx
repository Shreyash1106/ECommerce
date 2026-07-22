import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

// Sample initial items for demo persistence
const MOCK_WISHLIST = [
  {
    id: 1,
    name: "Wireless Noise Cancelling Headphones",
    price: 299.99,
    discount_percentage: 15,
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    description: "Premium over-ear headphones with 30-hour battery life and active noise cancellation.",
    brand: "Sony",
    in_stock: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch Series 9",
    price: 199.50,
    discount_percentage: 10,
    rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    description: "Waterproof smartwatch with ECG monitor, GPS tracking, and OLED display.",
    brand: "Apple",
    in_stock: true,
  },
];

export default function WishlistPage() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  const removeItem = (id, name) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Removed "${name}" from your wishlist`, { icon: "💔" });
  };

  const clearAll = () => {
    setWishlistItems([]);
    toast.success("Wishlist cleared");
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
    toast.success(`Moved "${product.name}" to your cart!`, { icon: "🛒" });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link to="/home" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              My Saved Wishlist <span className="text-sm font-black bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full">{wishlistItems.length} Saved</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Save items for later or move them directly to your shopping cart.</p>
          </div>

          {wishlistItems.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={clearAll}
              icon={Trash2}
              className="text-xs font-bold"
            >
              Clear All Saved Items
            </Button>
          )}
        </div>

        {/* Wishlist Grid / Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-12 shadow-sm">
            <EmptyState
              icon={Heart}
              title="Your Wishlist is Empty"
              description="Explore our marketplace catalog and click the heart icon on items you love."
              action={
                <Link to="/search" className="btn-primary text-xs font-bold px-6 py-3">
                  Browse Featured Products
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const discount = item.discount_percentage || 0;
                const oldPrice = discount > 0 ? (item.price / (1 - discount / 100)).toFixed(2) : null;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Image */}
                      <div className="h-48 bg-slate-100/70 rounded-2xl overflow-hidden relative border border-slate-100 mb-4 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Package className="w-12 h-12 text-slate-400" />
                        )}

                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm">
                            {discount}% OFF
                          </span>
                        )}

                        <button
                          onClick={() => removeItem(item.id, item.name)}
                          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors shadow-sm"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info */}
                      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{item.brand || "Official Brand"}</p>
                      <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{item.description}</p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-black text-slate-900">${Number(item.price).toFixed(2)}</span>
                        {oldPrice && <span className="text-xs font-semibold text-slate-400 line-through">${oldPrice}</span>}
                      </div>
                    </div>

                    {/* Move to Cart CTA */}
                    <div className="pt-3 border-t border-slate-100 flex gap-2">
                      <Button
                        variant="amber"
                        size="md"
                        onClick={() => handleMoveToCart(item)}
                        className="w-full text-xs font-black"
                        icon={ShoppingCart}
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
