import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary", // 'primary' | 'amber' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = "md", // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed select-none font-sans";

  const sizes = {
    sm: "h-10 px-4 text-xs rounded-xl",
    md: "h-12 px-6 text-sm rounded-[14px]",
    lg: "h-14 px-8 text-base rounded-[16px]",
  };

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-600/25 border border-blue-600",
    amber:
      "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-amber-500",
    secondary:
      "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm",
    outline:
      "bg-transparent hover:bg-blue-50 text-blue-600 border-2 border-blue-600",
    ghost:
      "bg-transparent hover:bg-slate-100/80 text-slate-700 border border-transparent",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-sm",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
}
