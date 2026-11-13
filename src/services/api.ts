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
  SponsorData,
  BackgroundImageData,
  CertificateTemplateData,
  CertificateData,
  CertificateLookupResult,
  CertificateVerifyResult,
  TicketTypeData,
  UpdateAttendeeItem,
  WhatsAppInstanceStatus,
  WhatsAppQRResponse,
  WhatsAppTestResult,
  WhatsAppQueueStats,
  WhatsAppQueueConfig,
  WhatsAppPairingCodeResponse,
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

  async reportWhatsAppReceipt(
    orderIdOrNumber: string,
    referenceNumber?: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/orders/report-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIdOrNumber, referenceNumber }),
    });
    return handleResponse(res);
  },

  async getOrderStatus(idOrNumber: string): Promise<{ order: OrderData }> {
    const res = await fetch(`${API_BASE}/orders/status/${encodeURIComponent(idOrNumber)}`);
    return handleResponse(res);
  },

  async updateOrderAttendees(
    idOrNumber: string,
    attendees: UpdateAttendeeItem[]
  ): Promise<{ message: string; tickets: TicketData[] }> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(idOrNumber)}/attendees`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendees }),
    });
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

  async deleteOrder(orderId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getAdminPaymentSettings(): Promise<{ paymentSetting: PaymentSettingData }> {
    const res = await fetch(`${API_BASE}/admin/payment-settings`, {
      headers: getAuthHeader(),
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

  async uploadPaymentQr(
    id: string,
    file: File
  ): Promise<{ message: string; paymentSetting: PaymentSettingData; qrImageUrl: string }> {
    const formData = new FormData();
    formData.append('qrImage', file);

    const res = await fetch(`${API_BASE}/admin/payment-settings/${id}/qr`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async getTicketTypes(): Promise<{ ticketTypes: TicketTypeData[] }> {
    const res = await fetch(`${API_BASE}/admin/ticket-types`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async createTicketType(data: {
    name: string;
    description?: string;
    price: number;
    totalQuota?: number;
    eventId?: string;
  }): Promise<{ message: string; ticketType: TicketTypeData }> {
    const res = await fetch(`${API_BASE}/admin/ticket-types`, {
      method: 'POST',
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

  async deleteTicketType(
    id: string
  ): Promise<{ message: string; softDeleted?: boolean }> {
    const res = await fetch(`${API_BASE}/admin/ticket-types/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
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

  async getBackgroundImages(): Promise<{ images: BackgroundImageData[] }> {
    const res = await fetch(`${API_BASE}/backgrounds`);
    return handleResponse(res);
  },

  async getAdminBackgroundImages(): Promise<{ images: BackgroundImageData[] }> {
    const res = await fetch(`${API_BASE}/backgrounds/admin`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async uploadBackgroundImage(formData: FormData): Promise<{ image: BackgroundImageData }> {
    const res = await fetch(`${API_BASE}/backgrounds`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteBackgroundImage(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/backgrounds/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getPublicSpeakers(): Promise<{ speakers: SpeakerData[] }> {
    const res = await fetch(`${API_BASE}/speakers/public`);
    return handleResponse(res);
  },

  async getSponsors(): Promise<{ sponsors: SponsorData[] }> {
    const res = await fetch(`${API_BASE}/sponsors`);
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

  // ==========================================
  // Módulo de Administración de WhatsApp (Evolution API)
  // ==========================================

  async getWhatsAppStatus(): Promise<WhatsAppInstanceStatus> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/status`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async getWhatsAppQR(): Promise<WhatsAppQRResponse> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/qr`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async restartWhatsAppInstance(): Promise<{ message: string; data?: any }> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/restart`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async logoutWhatsAppInstance(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/logout`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async sendWhatsAppTest(phone: string, message?: string): Promise<WhatsAppTestResult> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ phone, message }),
    });
    return handleResponse(res);
  },

  async getWhatsAppPairingCode(phone: string): Promise<WhatsAppPairingCodeResponse> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/pairing-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ phone }),
    });
    return handleResponse(res);
  },

  async getWhatsAppQueueStats(): Promise<WhatsAppQueueStats> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/queue-stats`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  async updateWhatsAppQueueConfig(
    config: Partial<WhatsAppQueueConfig>
  ): Promise<{ message: string; config: WhatsAppQueueConfig }> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/queue-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  async clearWhatsAppQueue(): Promise<{ message: string; stats: WhatsAppQueueStats }> {
    const res = await fetch(`${API_BASE}/admin/whatsapp/queue-clear`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },
};
