import { useQuery } from '@tanstack/react-query';

// Base API URL – adjust if your backend runs on a different host/port
const API_BASE = '/api'; // Assuming a proxy is set up; otherwise use full URL e.g., 'http://localhost:8000'

/** Helper to perform a GET request and parse JSON */
const fetchJSON = async (endpoint) => {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${errorText}`);
  }
  return res.json();
};

/** Overview KPIs */
export const useAnalyticsOverview = () => {
  return useQuery(['analytics', 'overview'], () => fetchJSON('/analytics/overview'));
};

/** Revenue time‑series data */
export const useRevenueSeries = () => {
  return useQuery(['analytics', 'revenueSeries'], () => fetchJSON('/analytics/revenue'));
};

/** Orders time‑series data */
export const useOrdersSeries = () => {
  return useQuery(['analytics', 'ordersSeries'], () => fetchJSON('/analytics/orders'));
};

/** Customer growth series */
export const useCustomerSeries = () => {
  return useQuery(['analytics', 'customerSeries'], () => fetchJSON('/analytics/customers'));
};

/** Sales by category */
export const useCategorySales = () => {
  return useQuery(['analytics', 'categorySales'], () => fetchJSON('/analytics/categories'));
};

/** Top products */
export const useTopProducts = () => {
  return useQuery(['analytics', 'topProducts'], () => fetchJSON('/analytics/top-products'));
};
