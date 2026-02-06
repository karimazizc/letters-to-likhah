import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Global React Query client.
 *
 * staleTime  – data stays "fresh" for 2 min → no refetch on re-mount.
 * gcTime     – unused cache kept for 10 min before garbage-collected.
 * retry      – one retry on failure (quick fail for 4xx).
 * refetchOnWindowFocus – background refresh when user tabs back.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,           // rely on staleTime instead
    },
  },
})

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export { queryClient }
