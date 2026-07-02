import React, { useState } from "react";

export default function AppImage({ src, alt = "image", className = "", style = {}, placeholder = "https://via.placeholder.com/400x300?text=No+Image" }) {
  const [err, setErr] = useState(false);
  const srcToUse = !src || err ? placeholder : src;
  return (
    <img
      src={srcToUse}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}
