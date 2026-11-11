export interface EventData {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  date: string;
  location: string;
  venue: string;
  bannerUrl?: string;
  isActive: boolean;
  maxCapacity: number;
  ticketTypes: TicketTypeData[];
}

export interface TicketTypeData {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  totalQuota: number;
  remainingQuota: number;
  isActive: boolean;
}

export interface PaymentSettingData {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  holderId: string;
  instructions?: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface OrderItemData {
  id: string;
  ticketTypeId: string;
  ticketType: TicketTypeData;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TicketData {
  id: string;
  ticketCode: string;
  orderId: string;
  ticketTypeId: string;
  ticketType: TicketTypeData;
  attendeeName: string;
  attendeeEmail: string;
  attendeeDocumentId: string;
  qrCodeData?: string;
  qrDataUrl?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: { name: string };
}

export interface OrderData {
  id: string;
  orderNumber: string;
  eventId: string;
  event: EventData;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerDocumentId: string;
  totalAmount: number;
  status: OrderStatus;
  proofReceiptUrl?: string;
  proofReferenceNumber?: string;
  adminNotes?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItemData[];
  tickets: TicketData[];
}

export interface AttendeeInput {
  ticketTypeId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeDocumentId: string;
}

export interface CreateOrderPayload {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerDocumentId: string;
  attendees: AttendeeInput[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
}

export interface DashboardStats {
  totalOrders: number;
  pendingApprovals: number;
  approvedOrdersCount: number;
  totalRevenue: number;
  totalTickets: number;
  checkedInTickets: number;
  checkInPercentage: number;
  ticketTypes: Array<TicketTypeData & { _count: { tickets: number } }>;
}

export interface CheckInResult {
  status: 'SUCCESS' | 'ALREADY_USED' | 'UNPAID' | 'INVALID';
  message?: string;
  error?: string;
  ticket?: {
    ticketCode?: string;
    attendeeName?: string;
    attendeeDocumentId?: string;
    attendeeEmail?: string;
    ticketType?: string;
    checkedInAt?: string;
    checkedInBy?: string;
    orderNumber?: string;
  };
}
