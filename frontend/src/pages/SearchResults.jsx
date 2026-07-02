import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import AppImage from "../components/ui/AppImage";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => client.get(`/search/products?q=${encodeURIComponent(q)}&limit=20`).then((r) => r.data),
    enabled: !!q,
    retry: false,
  });

  return (
    <div className="page-container">
      <div>
        <h1 className="text-lg font-semibold text-white">Search Results</h1>
        {q && (
          <p className="text-sm text-gray-400 mt-0.5">
            Results for: <span className="text-white font-medium">"{q}"</span>
            {results && <span className="text-gray-500 ml-2">({results.length} found)</span>}
          </p>
        )}
      </div>

      {!q ? (
        <div className="section-card">
          <EmptyState icon={Search} title="Enter a search term" description="Use the search bar above to find products" />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : !results?.length ? (
        <div className="section-card">
          <EmptyState icon={Search} title="No results found" description={`No products match "${q}". Try different keywords.`} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="section-card hover:border-gray-700 transition-colors block">
              <div className="h-36 bg-gray-800 flex items-center justify-center rounded-t-xl overflow-hidden">
                {p.image_url
                  ? <AppImage src={p.image_url} alt={p.name} variant="product" className="w-full h-full object-cover rounded-t-xl" />
                  : <AppImage src={null} alt={p.name} variant="product" className="w-full h-full object-cover rounded-t-xl" />
                }
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-200 truncate mb-1">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-gray-500 truncate mb-2">{p.description}</p>
                )}
                <p className="text-base font-bold text-indigo-400">${Number(p.price).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
