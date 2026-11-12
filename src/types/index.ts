export interface BackgroundImageData {
  id: string;
  eventId?: string;
  imageUrl: string;
  title?: string;
  order: number;
  isActive: boolean;
}

export interface SponsorData {
  id: string;
  eventId?: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  tier: string;
  order: number;
  isActive: boolean;
}

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
  sponsors?: SponsorData[];
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
  bankName?: string | null;
  accountType?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  holderId?: string | null;
  qrImageUrl?: string | null;
  whatsappContactNumber?: string | null;
  instructions?: string | null;
  isActive: boolean;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentMethod = 'TRANSFER' | 'CASH';

export type UserRole = 'ADMIN' | 'VALIDATOR' | 'VOLUNTEER' | 'CHECKIN' | 'STAFF';

export type CertificateCategory = 'ATTENDEE' | 'SPEAKER' | 'VOLUNTEER' | 'VIP';

export interface SpeakerData {
  id: string;
  eventId: string;
  name: string;
  role: string;
  topic: string;
  bio?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export interface CertificateTemplateData {
  id: string;
  eventId: string;
  category: CertificateCategory;
  title: string;
  description?: string;
  backgroundImageUrl: string;
  isActive: boolean;
}

export interface CertificateData {
  id: string;
  certificateCode: string;
  eventId: string;
  category: CertificateCategory;
  recipientName: string;
  recipientDocumentId: string;
  ticketId?: string;
  qrCodeData: string;
  qrDataUrl?: string;
  issuedAt: string;
  template?: CertificateTemplateData;
  event?: EventData;
  ticket?: TicketData;
}

export interface CertificateLookupResult {
  status: 'SUCCESS' | 'NOT_FOUND' | 'NOT_CHECKED_IN' | 'ORDER_NOT_APPROVED';
  message?: string;
  certificate?: CertificateData;
  ticket?: {
    attendeeName: string;
    attendeeDocumentId: string;
    ticketType: string;
    ticketCode: string;
  };
}

export interface CertificateVerifyResult {
  valid: boolean;
  error?: string;
  certificate?: {
    code: string;
    recipientName: string;
    recipientDocumentId: string;
    category: CertificateCategory;
    eventName: string;
    eventDate: string;
    issuedAt: string;
    templateTitle?: string;
    verifiedAt: string;
  };
}

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
  whatsappSentAt?: string;
  whatsappSentCount?: number;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  eventId: string;
  event: EventData;
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone: string;
  buyerDocumentId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  proofReceiptUrl?: string;
  proofReferenceNumber?: string;
  adminNotes?: string;
  lockedById?: string;
  lockedBy?: { id: string; name: string; email: string };
  lockedAt?: string;
  reviewedById?: string;
  reviewedBy?: { id: string; name: string; email: string };
  reviewedAt?: string;
  collectedById?: string;
  collectedBy?: { id: string; name: string; email: string };
  whatsappSentAt?: string;
  whatsappSentCount?: number;
  isLocked?: boolean;
  isLockedByMe?: boolean;
  lockRemainingSeconds?: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItemData[];
  tickets: TicketData[];
}

export interface AttendeeInput {
  ticketTypeId: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeeDocumentId?: string;
}

export interface UpdateAttendeeItem {
  id?: string;
  ticketCode?: string;
  attendeeName: string;
  attendeeDocumentId: string;
  attendeeEmail?: string;
}

export interface CreateOrderPayload {
  eventId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  buyerDocumentId: string;
  items?: Array<{ ticketTypeId: string; quantity: number }>;
  attendees?: AttendeeInput[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

export interface ValidatorStats {
  pendingQueueCount: number;
  myApprovedToday: number;
  myRejectedToday: number;
  myTotalToday: number;
  teamTotalApprovedToday: number;
}

export interface WhatsAppDispatchResult {
  message: string;
  success: boolean;
  waMeUrl: string;
  formattedPhone?: string;
  ticketId?: string;
  ticketCode?: string;
  results?: Array<{
    ticketCode: string;
    attendeeName: string;
    success: boolean;
    message: string;
    waMeUrl: string;
  }>;
}

export interface VolunteerCashSummary {
  volunteerId: string;
  todayCashOrdersCount: number;
  todayCashTicketsCount: number;
  todayCashTotalAmount: number;
  orders: OrderData[];
}
