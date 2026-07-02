// src/api/adminApi.js
// Simple wrapper for admin related endpoints using the Axios client.
import client from "./client.js";

export const fetchUsers = () => client.get("/admin/users");
export const fetchProducts = () => client.get("/admin/products");
export const fetchOrders = () => client.get("/admin/orders");
export const fetchAnalytics = () => client.get("/admin/analytics");
export const fetchNotifications = () => client.get("/admin/notifications");

// CRUD helpers (placeholder – actual payload shape depends on backend)
export const createUser = (data) => client.post("/admin/users", data);
export const updateUser = (id, data) => client.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`);

export const createProduct = (data) => client.post("/admin/products", data);
export const updateProduct = (id, data) => client.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => client.delete(`/admin/products/${id}`);
export const getProductById = (id) => client.get(`/products/${id}`);
