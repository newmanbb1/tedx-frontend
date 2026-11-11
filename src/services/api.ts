import {
  EventData,
  PaymentSettingData,
  OrderData,
  CreateOrderPayload,
  UserData,
  DashboardStats,
  CheckInResult,
  TicketData,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('tedx_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado');
  }
  return data as T;
}

export const api = {
  async getPublicEvent(): Promise<{ event: EventData; paymentSettings: PaymentSettingData[] }> {
    const res = await fetch(`${API_BASE}/events/public`);
    return handleResponse(res);
  },

  async createOrder(payload: CreateOrderPayload): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async uploadReceipt(
    orderIdOrNumber: string,
    file: File,
    referenceNumber?: string
  ): Promise<{ message: string; order: OrderData }> {
    const formData = new FormData();
    formData.append('orderIdOrNumber', orderIdOrNumber);
    formData.append('receipt', file);
    if (referenceNumber) {
      formData.append('referenceNumber', referenceNumber);
    }

    const res = await fetch(`${API_BASE}/orders/upload-receipt`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async getOrderStatus(idOrNumber: string): Promise<{ order: OrderData }> {
    const res = await fetch(`${API_BASE}/orders/status/${encodeURIComponent(idOrNumber)}`);
    return handleResponse(res);
  },

  async getTicket(code: string): Promise<{ ticket: TicketData }> {
    const res = await fetch(`${API_BASE}/orders/ticket/${encodeURIComponent(code)}`);
    return handleResponse(res);
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserData }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ token: string; user: UserData }>(res);
    localStorage.setItem('tedx_auth_token', data.token);
    return data;
  },

  async getMe(): Promise<{ user: UserData }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  logout() {
    localStorage.removeItem('tedx_auth_token');
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getOrders(status?: string, search?: string): Promise<{ orders: OrderData[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async approveOrder(orderId: string, adminNotes?: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ adminNotes }),
    });
    return handleResponse(res);
  },

  async rejectOrder(orderId: string, reason: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async updatePaymentSettings(
    id: string,
    data: Partial<PaymentSettingData>
  ): Promise<{ message: string; paymentSetting: PaymentSettingData }> {
    const res = await fetch(`${API_BASE}/admin/payment-settings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async validateTicket(codeOrPayload: string): Promise<CheckInResult> {
    const res = await fetch(`${API_BASE}/checkin/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ codeOrPayload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: data.status || 'INVALID',
        error: data.error || 'Error al validar boleto',
        ticket: data.ticket,
      };
    }
    return data as CheckInResult;
  },

  async searchAttendees(query: string): Promise<{ attendees: TicketData[] }> {
    const res = await fetch(`${API_BASE}/checkin/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },
};

