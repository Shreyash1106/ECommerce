import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Eye, Package, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import Button from "./Button";
import toast from "react-hot-toast";

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.discount_percentage || 0;
  const oldPrice = discount > 0 ? (product.price / (1 - discount / 100)).toFixed(2) : null;
  const stock = product.inventory?.quantity ?? 10;
  const isLowStock = stock > 0 && stock < 10;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate("/checkout");
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist!", {
      icon: isWishlisted ? "💔" : "❤️",
    });
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-slate-200/80 rounded-[20px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between group relative font-sans"
    >
      <div>
        {/* Image Frame */}
        <div className="h-56 bg-slate-100/70 flex items-center justify-center overflow-hidden relative border-b border-slate-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Package className="w-12 h-12 text-slate-400" />
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm tracking-wider uppercase">
                {discount}% OFF
              </span>
            )}
            <span className="bg-slate-950/80 backdrop-blur-md text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> 24H Delivery
            </span>
          </div>

          {/* Low Stock Badge */}
          {isLowStock && (
            <span className="absolute top-3 right-12 bg-rose-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm z-10">
              Only {stock} Left
            </span>
          )}

          {/* Wishlist Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md z-10 ${
              isWishlisted
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white"
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </motion.button>

          {/* Quick View Button Overlay */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md shadow-xl flex items-center gap-1.5 z-10"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-2">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            {product.brand || product.category?.name || "Official Brand"}
          </p>
          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-xs font-black text-slate-900">{product.rating || 4.5}</span>
            <span className="text-[11px] font-medium text-slate-400">(128 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
            {oldPrice && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ${oldPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddToCart}
          className="w-full text-xs"
          icon={ShoppingCart}
        >
          Add
        </Button>
        <Button
          variant="amber"
          size="sm"
          onClick={handleBuyNow}
          className="w-full text-xs"
          icon={Zap}
        >
          Buy Now
        </Button>
      </div>
    </motion.div>
  );
}
