import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch analytics data for the admin dashboard.
 * It queries the backend endpoint `/api/analytics/dashboard` and returns
 * the response data along with loading and error states.
 */
export default function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard', {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
