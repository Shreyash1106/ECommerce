import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, ShoppingCart, Tag, Layers, Star, Percent, Calendar,
  Palette, Ruler, Shirt, ShieldCheck, Truck, RotateCcw, Zap, CheckCircle2,
  Share2, Heart, Award, CreditCard
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  const { addToCart } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // 'description' | 'specifications' | 'reviews'
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => client.get(`/products/${id}`).then((r) => r.data),
    retry: false,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["relatedProducts"],
    queryFn: () => client.get("/products").then((r) => (r.data || []).slice(0, 4)),
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

  // Mock image gallery thumbnails
  const galleryImages = product.image_url
    ? [product.image_url, product.image_url, product.image_url]
    : [];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
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

        {/* Main Grid: Gallery & Main Info (2 cols) + Sticky Purchase Card (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Images & Product Specs */}
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

              {/* Main Preview Image */}
              <div className="flex-1 h-96 bg-slate-100/70 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center relative">
                {product.image_url ? (
                  <img src={galleryImages[selectedImage] || product.image_url} alt={product.name} className="w-full h-full object-cover" />
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

            {/* Title, Brand, Rating & Seller Card */}
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
                  <span className="text-xs font-semibold text-slate-500">128 Customer Ratings & Reviews</span>
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
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg ml-auto">
                    Save ${(oldPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
                    <p className="text-[10px] text-slate-500">Ships in 24 hours</p>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">100% Protection</h4>
                    <p className="text-[10px] text-slate-500">Certified Authentic</p>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">30-Day Returns</h4>
                    <p className="text-[10px] text-slate-500">Hassle-Free Policy</p>
                  </div>
                </div>
              </div>

              {/* Tabbed Specs / Description / Reviews */}
              <div className="pt-4">
                <div className="flex border-b border-slate-200 gap-6">
                  {["description", "specifications", "reviews"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        activeTab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="py-6 text-sm leading-relaxed text-slate-600">
                  {activeTab === "description" && (
                    <p>{product.description || "High quality product built for premium durability and style."}</p>
                  )}

                  {activeTab === "specifications" && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">Brand:</span>
                        <span className="font-bold text-slate-900">{product.brand || "CommerceOS"}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">Category:</span>
                        <span className="font-bold text-slate-900">{product.category?.name || "General"}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">Warranty:</span>
                        <span className="font-bold text-slate-900">1 Year Brand Warranty</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">Model Year:</span>
                        <span className="font-bold text-slate-900">2026 Edition</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </div>
                        <p className="font-bold text-slate-900 text-xs">"Exceptional quality and super fast shipping!"</p>
                        <p className="text-[11px] text-slate-500">By Verified Customer - July 2026</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right 1 Col: Sticky Purchase Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-xl sticky top-28 space-y-6">
              
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Purchase Summary</h3>

              <div className="space-y-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ${Number(product.price).toFixed(2)}
                </span>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Available for Immediate Dispatch
                </p>
              </div>

              {/* Quantity Adjuster */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</label>
                <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-xl"
                  >−</button>
                  <span className="font-black text-base text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-xl"
                  >+</button>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleAddToCart}
                  className="w-full text-sm font-bold"
                  icon={ShoppingCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="amber"
                  size="md"
                  onClick={handleBuyNow}
                  className="w-full text-sm font-black"
                  icon={Zap}
                >
                  Buy Now
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Ships directly from Official Merchant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Secure 256-bit Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Frequently Bought Together / Related Products */}
        <section className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Related Marketplace Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
