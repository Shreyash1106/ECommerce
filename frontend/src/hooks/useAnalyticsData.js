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
  return useQuery({ queryKey: ['analytics', 'overview'], queryFn: () => fetchJSON('/analytics/overview') });
};

/** Revenue time‑series data */
export const useRevenueSeries = () => {
  return useQuery({ queryKey: ['analytics', 'revenueSeries'], queryFn: () => fetchJSON('/analytics/revenue') });
};

/** Orders time‑series data */
export const useOrdersSeries = () => {
  return useQuery({ queryKey: ['analytics', 'ordersSeries'], queryFn: () => fetchJSON('/analytics/orders') });
};

/** Customer growth series */
export const useCustomerSeries = () => {
  return useQuery({ queryKey: ['analytics', 'customerSeries'], queryFn: () => fetchJSON('/analytics/customers') });
};

/** Sales by category */
export const useCategorySales = () => {
  return useQuery({ queryKey: ['analytics', 'categorySales'], queryFn: () => fetchJSON('/analytics/categories') });
};

/** Top products */
export const useTopProducts = () => {
  return useQuery({ queryKey: ['analytics', 'topProducts'], queryFn: () => fetchJSON('/analytics/top-products') });
};
