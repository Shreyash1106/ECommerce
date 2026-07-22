// src/api/adminApi.js
// Wrapper for admin related endpoints using the Axios client.
import client from "./client.js";

export const fetchUsers = () => client.get("/admin/users");
export const fetchProducts = () => client.get("/products");
export const fetchOrders = () => client.get("/orders");
export const fetchAnalytics = () => client.get("/analytics/dashboard");
export const fetchNotifications = () => client.get("/notifications");

// CRUD helpers
export const createUser = (data) => client.post("/auth/register", data);
export const updateUser = (id, data) => client.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`);

export const createProduct = (data) => client.post("/products", data);
export const updateProduct = (id, data) => client.put(`/products/${id}`, data);
export const deleteProduct = (id) => client.delete(`/products/${id}`);
export const getProductById = (id) => client.get(`/products/${id}`);

