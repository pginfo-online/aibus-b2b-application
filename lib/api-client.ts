// ---------------------------------------------------------------------------
// AiBus B2B Agent Portal — Centralized Production API Client
// Standard transport layer with automatic auth injection, token refresh,
// error normalization, timeout handling, and file downloads.
// ---------------------------------------------------------------------------

import { useAuthStore } from "@/store/auth-store";
import { normalizeError, NormalizedApiError } from "./error-normalizer";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009/api/v1";
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeoutMs?: number;
  skipAuth?: boolean;
  idempotencyKey?: string;
}

const DEFAULT_TIMEOUT_MS = 25000;

// Token refresh mutex
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const { tokens, updateTokens, clearAuth } = useAuthStore.getState();
  if (!tokens?.refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const payload = await res.json();
    if (payload.success && payload.data?.accessToken) {
      const newTokens = {
        accessToken: payload.data.accessToken,
        refreshToken: payload.data.refreshToken || tokens.refreshToken,
        expiresIn: payload.data.expiresIn,
      };
      updateTokens(newTokens);
      return newTokens.accessToken;
    } else {
      clearAuth();
      return null;
    }
  } catch {
    clearAuth();
    return null;
  }
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${cleanEndpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  let bodyContent: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      bodyContent = options.body;
      // Let browser set multipart boundary
    } else {
      headers["Content-Type"] = "application/json";
      bodyContent = JSON.stringify(options.body);
    }
  }

  // Auth Header Injection
  if (!options.skipAuth) {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      body: bodyContent,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // Automatic token refresh handling on 401
    if (response.status === 401 && !options.skipAuth) {
      const { tokens } = useAuthStore.getState();
      if (tokens?.refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newToken);

          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            const retryRes = await fetch(url.toString(), {
              ...options,
              headers,
              body: bodyContent,
            });
            return handleResponse<T>(retryRes);
          }
        } else {
          // Wait for concurrent refresh
          return new Promise<T>((resolve, reject) => {
            subscribeTokenRefresh(async (newToken) => {
              if (newToken) {
                headers.Authorization = `Bearer ${newToken}`;
                try {
                  const retryRes = await fetch(url.toString(), {
                    ...options,
                    headers,
                    body: bodyContent,
                  });
                  resolve(await handleResponse<T>(retryRes));
                } catch (retryErr) {
                  reject(normalizeError(retryErr));
                }
              } else {
                reject(
                  new NormalizedApiError({
                    message: "Session expired. Please log in again.",
                    category: "AUTHENTICATION",
                    status: 401,
                    code: "AUTH_EXPIRED",
                    localizedMessage: {
                      en: "Your session has expired. Please log in again.",
                      hi: "आपका सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।",
                      mr: "तुमचे सत्र कालबाह्य झाले आहे. कृपया पुन्हा लॉगिन करा.",
                    },
                    safeToRetry: false,
                  })
                );
              }
            });
          });
        }
      }
    }

    return await handleResponse<T>(response);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    throw normalizeError(err);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let errorJson: { message?: string; code?: string; details?: unknown; error?: { message?: string; code?: string; details?: unknown } } | null = null;
    try {
      if (contentType.includes("application/json")) {
        errorJson = await res.json();
      }
    } catch {}

    const status = res.status;
    const message = errorJson?.message || errorJson?.error?.message || `HTTP error ${status}`;
    const code = errorJson?.code || errorJson?.error?.code || `HTTP_${status}`;
    const details = errorJson?.details || errorJson?.error?.details;

    throw normalizeError({ status, code, message, details });
  }

  if (res.status === 204) {
    return {} as T;
  }

  if (contentType.includes("application/json")) {
    const json = await res.json();
    // Return inner data if standard envelope, else root
    if (json && typeof json === "object" && "success" in json && "data" in json) {
      return json.data as T;
    }
    return json as T;
  }

  return (await res.text()) as unknown as T;
}

/**
 * Download file helper (e.g. CSV reports, PDF tickets)
 */
export async function downloadFile(
  endpoint: string,
  filename: string,
  options: RequestOptions = {}
): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const { tokens } = useAuthStore.getState();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (tokens?.accessToken && !options.skipAuth) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const { params: _params, body: _body, timeoutMs: _timeoutMs, skipAuth: _skipAuth, idempotencyKey: _idempotencyKey, headers: _customHeaders, ...restOptions } = options;
  const res = await fetch(url.toString(), { ...restOptions, headers });
  if (!res.ok) {
    throw normalizeError({ status: res.status, message: "Failed to download file" });
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

// ---------------------------------------------------------------------------
// Typed HTTP convenience methods
// ---------------------------------------------------------------------------
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  download: downloadFile,
  downloadFile: downloadFile,
};
