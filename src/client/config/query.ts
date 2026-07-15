import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
