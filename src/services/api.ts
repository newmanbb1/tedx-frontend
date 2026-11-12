import {
  EventData,
  PaymentSettingData,
  OrderData,
  CreateOrderPayload,
  UserData,
  DashboardStats,
  CheckInResult,
  TicketData,
  ValidatorStats,
  WhatsAppDispatchResult,
  VolunteerCashSummary,
  SpeakerData,
  CertificateTemplateData,
  CertificateData,
  CertificateLookupResult,
  CertificateVerifyResult,
  TicketTypeData,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('tedx_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !res.url.includes('/auth/login')) {
      // Si un token guardado expiró o es inválido en una llamada protegida,
      // limpiamos el almacenamiento local y emitimos un evento para cerrar la sesión de forma limpia.
      localStorage.removeItem('tedx_auth_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tedx_auth_expired', {
            detail: {
              code: data.code || 'TOKEN_EXPIRED',
              error: data.error || 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            },
          })
        );
      }
    }
    const err: any = new Error(data.error || 'Ocurrió un error inesperado');
    err.code = data.code;
    err.status = res.status;
    throw err;
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

  async updateTicketType(
    id: string,
    data: Partial<TicketTypeData>
  ): Promise<{ message: string; ticketType: TicketTypeData }> {
    const res = await fetch(`${API_BASE}/admin/ticket-types/${id}`, {
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

  // ==========================================
  // Módulo de Validadores (Cola de 5 personas)
  // ==========================================

  async getValidatorQueue(): Promise<{ orders: OrderData[] }> {
    const res = await fetch(`${API_BASE}/validator/queue`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async claimValidatorOrder(id: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/validator/orders/${id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async releaseValidatorOrder(id: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/validator/orders/${id}/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async approveValidatorOrder(id: string, adminNotes?: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/validator/orders/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ adminNotes }),
    });
    return handleResponse(res);
  },

  async rejectValidatorOrder(id: string, reason: string): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/validator/orders/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async getValidatorStats(): Promise<ValidatorStats> {
    const res = await fetch(`${API_BASE}/validator/stats`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // ==========================================
  // Módulo de Voluntarios (Inscripción & WhatsApp)
  // ==========================================

  async volunteerRegister(formData: FormData): Promise<{ message: string; order: OrderData }> {
    const res = await fetch(`${API_BASE}/volunteer/register`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async lookupCarnet(carnet: string): Promise<{ query: string; totalFound: number; orders: OrderData[] }> {
    const res = await fetch(`${API_BASE}/volunteer/lookup-carnet?carnet=${encodeURIComponent(carnet)}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async dispatchWhatsApp(payload: {
    ticketId?: string;
    orderId?: string;
    targetPhone?: string;
  }): Promise<WhatsAppDispatchResult> {
    const res = await fetch(`${API_BASE}/volunteer/dispatch-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getVolunteerCashSummary(): Promise<VolunteerCashSummary> {
    const res = await fetch(`${API_BASE}/volunteer/cash-summary`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // ==========================================
  // Módulo de Speakers (Oradores)
  // ==========================================

  async getPublicSpeakers(): Promise<{ speakers: SpeakerData[] }> {
    const res = await fetch(`${API_BASE}/speakers/public`);
    return handleResponse(res);
  },

  async getAllSpeakers(): Promise<{ speakers: SpeakerData[] }> {
    const res = await fetch(`${API_BASE}/speakers`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async createSpeaker(formData: FormData): Promise<{ message: string; speaker: SpeakerData }> {
    const res = await fetch(`${API_BASE}/speakers`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async updateSpeaker(id: string, formData: FormData): Promise<{ message: string; speaker: SpeakerData }> {
    const res = await fetch(`${API_BASE}/speakers/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteSpeaker(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/speakers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // ==========================================
  // Módulo de Certificados Digitales (4 Modelos)
  // ==========================================

  async getCertificateTemplates(): Promise<{ templates: CertificateTemplateData[] }> {
    const res = await fetch(`${API_BASE}/certificates/templates`);
    return handleResponse(res);
  },

  async updateCertificateTemplate(
    category: string,
    formData: FormData
  ): Promise<{ message: string; template: CertificateTemplateData }> {
    const res = await fetch(`${API_BASE}/certificates/templates/${category}`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async lookupCertificate(query: string): Promise<CertificateLookupResult> {
    const res = await fetch(`${API_BASE}/certificates/lookup?query=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },

  async verifyCertificate(code: string): Promise<CertificateVerifyResult> {
    const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(code)}`);
    return handleResponse(res);
  },

  async issueManualCertificate(data: {
    recipientName: string;
    recipientDocumentId: string;
    category: string;
    eventId?: string;
  }): Promise<{ message: string; certificate: CertificateData }> {
    const res = await fetch(`${API_BASE}/certificates/manual-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getAllCertificates(): Promise<{ certificates: CertificateData[] }> {
    const res = await fetch(`${API_BASE}/certificates`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },
};
