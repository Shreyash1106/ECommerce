import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, Tag, Layers, Star, Percent, Calendar, Palette, Ruler, Shirt } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Badge from "../components/ui/Badge";
import AppImage from "../components/ui/AppImage";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => client.get(`/products/${id}`).then((r) => r.data),
    retry: false,
  });

  const orderMutation = useMutation({
    mutationFn: () => client.post("/orders", { product_id: Number(id), quantity }),
    onSuccess: () => toast.success("Order placed successfully!"),
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to place order."),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError || !product) return (
    <div className="min-h-screen text-white pb-10 px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 flex flex-col items-center text-center shadow-xl">
        <Package size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-200 mb-2">Product not found</h2>
        <p className="text-sm text-gray-500">This product may have been removed or is currently unavailable.</p>
      </div>
    </div>
  );

  const stock = product.inventory?.quantity ?? null;
  const inStock = stock === null || stock > 0;

  return (
    <div className="min-h-screen text-white pb-10 px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="w-full md:w-1/2 lg:w-[45%] bg-gray-800/50 flex items-center justify-center p-8 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 relative">
            <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-2xl">
              {product.image_url
                ? <AppImage src={product.image_url} alt={product.name} variant="product" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Package size={64} className="text-gray-600" /></div>
              }
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight mb-3">{product.name}</h1>
              {product.category && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-gray-400">
                  <Layers size={14} className="text-indigo-400" />
                  <span>{product.category.name || product.category}</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <p className="text-4xl lg:text-5xl font-extrabold text-indigo-400 tracking-tight">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div className="mb-8 prose prose-invert prose-sm">
                <p className="text-gray-300 leading-relaxed text-base">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              {product.brand && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Brand</p>
                  <p className="text-sm font-semibold text-white">{product.brand}</p>
                </div>
              )}
              {product.rating > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Star size={12} /> Rating
                  </p>
                  <p className="text-sm font-semibold text-yellow-400">{product.rating.toFixed(1)} / 5.0</p>
                </div>
              )}
              {product.discount_percentage > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Percent size={12} /> Discount
                  </p>
                  <p className="text-sm font-semibold text-green-400">{product.discount_percentage}% OFF</p>
                </div>
              )}
              {product.created_at && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Added
                  </p>
                  <p className="text-sm font-semibold text-gray-300">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {(product.color || product.size || product.material) && (
              <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                {product.color && (
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-pink-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Color</p>
                      <p className="text-sm font-semibold text-white">{product.color}</p>
                    </div>
                  </div>
                )}
                {product.size && (
                  <div className="flex items-center gap-2">
                    <Ruler size={16} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
                      <p className="text-sm font-semibold text-white">{product.size}</p>
                    </div>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2">
                    <Shirt size={16} className="text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Material</p>
                      <p className="text-sm font-semibold text-white">{product.material}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {inStock && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between sm:justify-start bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden w-full sm:w-auto">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-5 py-3.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-lg"
                  >−</button>
                  <span className="px-6 py-3.5 font-bold text-white border-x border-white/10 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock ?? 99, q + 1))}
                    className="px-5 py-3.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-lg"
                  >+</button>
                </div>
                <button
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isLoading}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {orderMutation.isLoading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShoppingCart size={18} /> Place Order</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
