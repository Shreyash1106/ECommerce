import React, { useState } from "react";
import { Package } from "lucide-react";

export default function ProductImageWithFallback({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackIconSize = "w-8 h-8",
  ...props
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}
        {...props}
      >
        <Package className={fallbackIconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Product image"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
