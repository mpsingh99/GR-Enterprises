import { Product, User, Order, Quote, StoreSettings, UserRole, B2BStatus } from '../types';

const API_BASE = '/api';

export interface HealthCheckResponse {
  status: string;
  store: string;
  timestamp: string;
  database: {
    connected: boolean;
    host: string;
    name: string;
    readyState: string;
  };
  version: string;
}

// Helper for safe fetch with JSON response
async function request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    // Return null if backend is not reachable so caller can gracefully fallback
    console.warn(`[API Client] ${endpoint} request failed:`, err);
    return null;
  }
}

// 1. Health & DB Diagnostic
export const checkHealth = async (): Promise<HealthCheckResponse | null> => {
  return request<HealthCheckResponse>('/health');
};

// 2. Products API
export const apiGetProducts = async (category?: string, search?: string): Promise<Product[] | null> => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return request<Product[]>(`/products${queryStr}`);
};

export const apiGetProductById = async (id: string): Promise<Product | null> => {
  return request<Product>(`/products/${id}`);
};

export const apiCreateProduct = async (product: Partial<Product>): Promise<Product | null> => {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
};

export const apiUpdateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  return request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
};

export const apiDeleteProduct = async (id: string): Promise<boolean> => {
  const result = await request<any>(`/products/${id}`, { method: 'DELETE' });
  return result !== null;
};

// 3. Auth & Users API
export const apiRegisterRetail = async (data: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: any;
}): Promise<User | null> => {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiGoogleSync = async (data: {
  credential?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  address?: any;
}): Promise<User | null> => {
  return request<User>('/auth/google-sync', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export interface SendOtpResponse {
  success: boolean;
  message: string;
  channel: 'sms' | 'whatsapp';
  phone: string;
  dispatched?: boolean;
  gatewayNotice?: string;
}

export const apiSendOtp = async (
  phone: string,
  channel: 'sms' | 'whatsapp' = 'sms'
): Promise<SendOtpResponse | null> => {
  return request<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, channel }),
  });
};

export const apiVerifyOtp = async (data: {
  phone: string;
  otp: string;
  name?: string;
  address?: any;
}): Promise<User | null> => {
  return request<User>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiLogin = async (email: string, password?: string): Promise<User | null> => {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const apiRegisterB2B = async (data: any): Promise<User | null> => {
  return request<User>('/auth/b2b-register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiGetUsers = async (): Promise<User[] | null> => {
  return request<User[]>('/auth/users');
};

export const apiUpdateUserRole = async (
  id: string,
  role?: UserRole,
  b2bStatus?: B2BStatus,
  creditLimit?: number,
  paymentTerms?: string,
  adminNotes?: string
): Promise<User | null> => {
  return request<User>(`/auth/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role, b2bStatus, creditLimit, paymentTerms, adminNotes }),
  });
};

// 4. Orders API
export const apiCreateOrder = async (order: Partial<Order>): Promise<Order | null> => {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
};

export const apiGetOrders = async (customerId?: string, mode?: string): Promise<Order[] | null> => {
  const params = new URLSearchParams();
  if (customerId) params.append('customerId', customerId);
  if (mode) params.append('mode', mode);
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return request<Order[]>(`/orders${queryStr}`);
};

export const apiGetOrderById = async (id: string): Promise<Order | null> => {
  return request<Order>(`/orders/${id}`);
};

export const apiUpdateOrderStatus = async (id: string, status: string, trackingNumber?: string): Promise<Order | null> => {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, trackingNumber }),
  });
};

// 5. Quotes (RFQ) API
export const apiCreateQuote = async (quote: Partial<Quote>): Promise<Quote | null> => {
  return request<Quote>('/quotes', {
    method: 'POST',
    body: JSON.stringify(quote),
  });
};

export const apiGetQuotes = async (businessId?: string): Promise<Quote[] | null> => {
  const queryStr = businessId ? `?businessId=${encodeURIComponent(businessId)}` : '';
  return request<Quote[]>(`/quotes${queryStr}`);
};

export const apiUpdateQuote = async (
  id: string,
  status?: string,
  offeredPricePerUnit?: number,
  adminResponseNote?: string
): Promise<Quote | null> => {
  return request<Quote>(`/quotes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, offeredPricePerUnit, adminResponseNote }),
  });
};

// 6. Store Settings API
export const apiGetSettings = async (): Promise<StoreSettings | null> => {
  return request<StoreSettings>('/settings');
};

export const apiUpdateSettings = async (settings: Partial<StoreSettings>): Promise<StoreSettings | null> => {
  return request<StoreSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};
