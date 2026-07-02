import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, Tag, Layers } from "lucide-react";
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
    <div className="page-container">
      <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>
      <div className="section-card p-8 flex flex-col items-center text-center">
        <Package size={32} className="text-gray-600 mb-3" />
        <h2 className="text-base font-semibold text-gray-200 mb-1">Product not found</h2>
        <p className="text-xs text-gray-500">This product may have been removed.</p>
      </div>
    </div>
  );

  const stock = product.inventory?.quantity ?? null;
  const inStock = stock === null || stock > 0;

  return (
    <div className="page-container max-w-3xl">
      <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>

      <div className="section-card overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Image placeholder */}
          <div className="w-full sm:w-48 h-48 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image_url
              ? <AppImage src={product.image_url} alt={product.name} variant="product" className="w-full h-full object-cover rounded-xl" />
              : <AppImage src={null} alt={product.name} variant="product" className="w-full h-full object-cover rounded-xl" />
            }
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-white">{product.name}</h1>
              {product.category && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Layers size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-500">{product.category.name || product.category}</span>
                </div>
              )}
            </div>

            <p className="text-2xl font-bold text-indigo-400">${Number(product.price).toFixed(2)}</p>

            {product.description && (
              <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-2">
              <Badge status={inStock ? "active" : "inactive"}>
                {stock !== null ? `${stock} in stock` : inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {inStock && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                  >−</button>
                  <span className="px-4 py-2 text-sm font-medium text-white border-x border-gray-700">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock ?? 99, q + 1))}
                    className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                  >+</button>
                </div>
                <button
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isLoading}
                  className="btn-primary"
                >
                  {orderMutation.isLoading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShoppingCart size={15} /> Place Order</>
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
