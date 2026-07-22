// src/api/vendorApi.js
// Wrapper for vendor-specific endpoints using the shared Axios client.
import client from "./client.js";

export const fetchVendorDashboard = () => client.get("/analytics/vendor");
export const fetchVendorProducts = () => client.get("/products");
export const fetchVendorOrders = () => client.get("/orders");
export const fetchVendorAnalytics = () => client.get("/analytics/vendor");

// Basic CRUD helpers
export const createVendorProduct = (data) => client.post("/products", data);
export const updateVendorProduct = (id, data) => client.put(`/products/${id}`, data);
export const deleteVendorProduct = (id) => client.delete(`/products/${id}`);

