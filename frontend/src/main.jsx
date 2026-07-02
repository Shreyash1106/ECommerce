import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./queryClient.js";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { Toaster } from "react-hot-toast";

// Force dark mode
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1a1a24", color: "#fff", border: "1px solid #252534" },
            success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
