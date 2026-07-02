// src/api/vendorApi.js
// Wrapper for vendor‑specific endpoints using the shared Axios client.
import client from "./client.js";

export const fetchVendorDashboard = () => client.get("/vendor/dashboard");
export const fetchVendorProducts = () => client.get("/vendor/products");
export const fetchVendorOrders = () => client.get("/vendor/orders");
export const fetchVendorAnalytics = () => client.get("/vendor/analytics");

// Basic CRUD helpers (payload shape depends on backend)
export const createVendorProduct = (data) => client.post("/vendor/products", data);
export const updateVendorProduct = (id, data) => client.put(`/vendor/products/${id}`, data);
export const deleteVendorProduct = (id) => client.delete(`/vendor/products/${id}`);
