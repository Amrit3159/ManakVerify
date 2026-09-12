import { auth } from '@/lib/firebase';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const TOKEN_KEY = 'mv_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  let token: string | null = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch {
      token = getStoredToken();
    }
  } else {
    token = getStoredToken();
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'Server returned an invalid response',
    data: null as any,
  }));

  if (!response.ok || !json.success) {
    const errorMsg =
      json.message || (json.errors && json.errors[0]?.message) || `HTTP error ${response.status}`;
    const err: any = new Error(errorMsg);
    err.statusCode = response.status;
    err.errors = json.errors;
    throw err;
  }

  return json.data;
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// ============================================================
// Specialized API Modules
// ============================================================

export const authApi = {
  sync: async (
    profileData?: { name?: string; phone?: string; businessName?: string },
    idToken?: string
  ) => {
    const headers: Record<string, string> = {};
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    const data = await request<any>('/auth/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...profileData, idToken }),
    });
    if (data?.token) {
      setStoredToken(data.token);
    }
    return data;
  },
  login: async (email: string, password: string) => {
    const data = await api.post<{ user: any; token: string }>('/auth/login', { email, password });
    if (data.token) setStoredToken(data.token);
    return data;
  },
  demoLogin: async (userId: string) => {
    const data = await api.post<{ user: any; token: string }>('/auth/demo-login', { userId });
    if (data.token) setStoredToken(data.token);
    return data;
  },
  register: async (registerData: any) => {
    const data = await api.post<{ user: any; token: string }>('/auth/register', registerData);
    if (data.token) setStoredToken(data.token);
    return data;
  },
  getMe: () => api.get<any>('/auth/me'),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStoredToken();
    }
  },
};

export const businessApi = {
  getMyProfile: () => api.get<any>('/business/profile'),
  getById: (id: string) => api.get<any>(`/business/${id}`),
  getAll: () => api.get<any[]>('/business'),
  update: (id: string, data: any) => api.put<any>(`/business/${id}`, data),
};

export const instrumentApi = {
  getAll: (businessId?: string) =>
    api.get<any[]>(businessId ? `/instruments?businessId=${encodeURIComponent(businessId)}` : '/instruments'),
  getById: (id: string) => api.get<any>(`/instruments/${id}`),
  create: (data: any) => api.post<any>('/instruments', data),
  update: (id: string, data: any) => api.put<any>(`/instruments/${id}`, data),
};

export const applicationApi = {
  getAll: (query?: Record<string, string>) => {
    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    return api.get<any[]>(`/applications${qs}`);
  },
  getById: (id: string) => api.get<any>(`/applications/${id}`),
  create: (data: any) => api.post<any>('/applications', data),
  assignInspector: (id: string, inspectorId: string, scheduledDate: string) =>
    api.post<any>(`/applications/${id}/assign-inspector`, { inspectorId, scheduledDate }),
  updateStatus: (id: string, status: string, remarks?: string) =>
    api.patch<any>(`/applications/${id}/status`, { status, remarks }),
};

export const inspectionApi = {
  getAll: (query?: Record<string, string>) => {
    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    return api.get<any[]>(`/inspections${qs}`);
  },
  getById: (id: string) => api.get<any>(`/inspections/${id}`),
  submit: (id: string, data: any) => api.post<any>(`/inspections/${id}/submit`, data),
};

export const certificateApi = {
  getAll: () => api.get<any[]>('/certificates'),
  getById: (id: string) => api.get<any>(`/certificates/${id}`),
  verifyPublic: (identifier: string) =>
    api.get<any>(`/public/certificates/verify?cert=${encodeURIComponent(identifier)}`),
};

export const notificationApi = {
  getAll: () => api.get<any[]>('/notifications'),
  markRead: (id: string) => api.patch<any>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<any>('/notifications/read-all'),
};

export const dashboardApi = {
  getStats: () => api.get<any>('/dashboard/stats'),
};
