import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'stale',
      refetchOnMount: 'stale',
    },
    mutations: {
      retry: 1,
      gcTime: 1000 * 60 * 5,
    },
  },
});

export default queryClient;
