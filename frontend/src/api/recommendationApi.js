// src/api/recommendationApi.js
import client from "./client.js";

export const fetchRecommendations = (type = "personalized") => client.get(`/recommendations?type=${type}`);
export const fetchRelated = (productId) => client.get(`/products/related/${productId}`);
