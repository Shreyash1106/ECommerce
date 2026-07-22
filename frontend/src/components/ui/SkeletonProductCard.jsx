import React from "react";

export default function SkeletonProductCard() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-sm space-y-4 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-slate-200/80 rounded-2xl w-full" />
      
      {/* Meta Skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>

      {/* Rating & Price */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-1/4" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div className="h-10 bg-slate-200 rounded-xl" />
        <div className="h-10 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
