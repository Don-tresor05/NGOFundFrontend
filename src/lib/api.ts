const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'ngofund_access_token';
const REFRESH_TOKEN_KEY = 'ngofund_refresh_token';

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(typeof data === 'object' && data && 'detail' in data ? String((data as { detail: unknown }).detail) : `API request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

export const tokenStorage = {
  get access() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  setAccess(access: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const refreshAccessToken = async () => {
  const refresh = tokenStorage.refresh;
  if (!refresh) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    return false;
  }

  const data = (await response.json()) as { access: string };
  tokenStorage.setAccess(data.access);
  return true;
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { skipAuth = false, retryOnUnauthorized = true, headers, body, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (!(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth && tokenStorage.access) {
    requestHeaders.set('Authorization', `Bearer ${tokenStorage.access}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body,
  });

  if (response.status === 401 && retryOnUnauthorized && !skipAuth && (await refreshAccessToken())) {
    return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
};

export const apiList = async <T>(path: string): Promise<T[]> => {
  const data = await apiRequest<PaginatedResponse<T> | T[]>(path);
  return Array.isArray(data) ? data : data.results;
};
