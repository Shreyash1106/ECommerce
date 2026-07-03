import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import client from '../api/client';
import LoadingSpinner from './ui/LoadingSpinner';
import AppImage from './ui/AppImage';
import { Heart, X, ShoppingCart, Eye, Package, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function QuickViewModal({ productId, onClose, onToggleWishlist, isInWishlist }) {
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['quickview-product', productId],
    queryFn: () => client.get(`/products/${productId}`).then(r => r.data),
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => client.post('/orders', { product_id: productId, quantity: 1 }).then(r => r.data),
    onSuccess: () => toast.success('Added to cart!'),
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to add to cart'),
  });

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 p-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {isError && (
          <div className="text-red-500 text-center py-4">Failed to load product.</div>
        )}
        {product && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48 h-48 bg-gray-800 flex items-center justify-center rounded-lg overflow-hidden">
              {product.image_url ? (
                <AppImage src={product.image_url} alt={product.name} variant="product" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Package size={48} className="text-gray-600" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold text-white">{product.name}</h2>
              <p className="text-sm text-gray-300">{product.category?.name || product.category}</p>
              <p className="text-sm text-gray-400">{product.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-semibold">${Number(product.price).toFixed(2)}</span>
                {product.discount_percentage > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                  </span>
                )}
                {product.rating > 0 && (
                  <span className="flex items-center text-yellow-400 text-sm ml-2">
                    <Star size={14} fill="#fbbf24" /> {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => addToCartMutation.mutate()}
                  className="btn-primary flex items-center gap-1"
                  disabled={addToCartMutation.isLoading}
                >
                  {addToCartMutation.isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={16} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
                >
                  <Heart size={18} className={isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  <Eye size={16} className="mr-1 inline" /> View Full Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
