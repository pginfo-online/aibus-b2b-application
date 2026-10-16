import { QueryClient } from "@tanstack/react-query";
import { NormalizedApiError } from "./error-normalizer";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute default stale time
        gcTime: 10 * 60 * 1000, // 10 minutes cache garbage collection time
        refetchOnWindowFocus: false, // Prevent jarring data jumps during active booking
        retry: (failureCount, error) => {
          // Check our error normalizer policy
          if (error instanceof NormalizedApiError) {
            if (!error.safeToRetry) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false, // Mutations (hold, book, pay, cancel, topup) are NEVER auto-retried
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
