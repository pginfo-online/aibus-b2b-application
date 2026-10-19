// ---------------------------------------------------------------------------
// AiBus B2B Agent Portal — Authoritative API & Domain Contracts
// Source of truth: Backend schemas, Prisma models & verified REST contracts
// ---------------------------------------------------------------------------

export type UserRole =
  | 'CUSTOMER'
  | 'OPERATOR_AGENT'
  | 'SUPPORT'
  | 'SUPPORT_AGENT'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type AgentStatus =
  | 'PENDING_KYC'
  | 'KYC_SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type AgentStaffRole =
  | 'OWNER'
  | 'MANAGER'
  | 'BOOKING_AGENT'
  | 'ACCOUNTANT'
  | 'VIEWER';

export type AgentKycDocType =
  | 'PAN_CARD'
  | 'GST_CERTIFICATE'
  | 'BUSINESS_REGISTRATION'
  | 'BANK_STATEMENT'
  | 'OWNER_IDENTITY'
  | 'CANCELLED_CHEQUE';

export type BookingStatus =
  | 'INITIATED'
  | 'HOLD_REQUESTED'
  | 'HELD'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'CONFIRMATION_PENDING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'RECONCILED'
  | 'DISPUTED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type TopupStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REVERSED';

// ---------------------------------------------------------------------------
// Standard Envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages?: number;
      pages?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Auth & User Types
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: UserProfile;
  tokens: AuthTokens;
  agent?: AgentOrganization | null;
  agentStaff?: AgentStaffMember | null;
}

// ---------------------------------------------------------------------------
// Agent Organization & Profile
// ---------------------------------------------------------------------------

export interface AgentWallet {
  id: string;
  agentId: string;
  cashBalance: number | string;
  creditLimit: number | string;
  creditUsed: number | string;
  totalSpent: number | string;
  totalTopups: number | string;
  totalCommission: number | string;
  isFrozen: boolean;
  frozenReason?: string | null;
  currency: string;
  updatedAt: string;
}

export interface AgentKycDocument {
  id: string;
  agentId: string;
  docType: AgentKycDocType;
  fileUrl: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;
  createdAt: string;
}

export interface AgentBankAccount {
  id: string;
  agentId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isPrimary: boolean;
  isVerified: boolean;
  withdrawFreezeUntil?: string | null;
  createdAt: string;
}

export interface AgentStaffMember {
  id: string;
  agentId: string;
  userId: string;
  role: AgentStaffRole;
  isActive: boolean;
  permissions?: Record<string, boolean> | null;
  invitedAt: string;
  joinedAt?: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface AgentOrganization {
  id: string;
  businessName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  businessAddress: string;
  city: string;
  state: string;
  pincode?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  status: AgentStatus;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  wallet?: AgentWallet | null;
  kycDocuments?: AgentKycDocument[];
  bankAccounts?: AgentBankAccount[];
  staff?: AgentStaffMember[];
}

// ---------------------------------------------------------------------------
// Cities & Search
// ---------------------------------------------------------------------------

export interface City {
  id: string;
  providerCityId: number;
  name: string;
  City: string;
  CityId: number;
  State?: string;
}

export interface BoardingPoint {
  PickupCode: string;
  PickupName: string;
  Address: string;
  Landmark?: string;
  Contact?: string;
  PickupTime: string;
}

export interface DroppingPoint {
  DropoffCode: string;
  DropoffName: string;
  DropoffTime: string;
  Address?: string;
  Landmark?: string;
  Contact?: string;
}

export interface CancellationPolicyRule {
  Amt: number;
  Pct: number;
  Mins: number;
}

export interface BusSearchResult {
  RouteBusId: number;
  CompanyId: number;
  CompanyName: string;
  BusTypeName: string;
  DepartureTime: string;
  ArrivalTime: string;
  TripId: string;
  ChartCode: string;
  TotalSeats: number;
  AvailableSeats: number;
  BaseFare: number;
  TotalFare: number;
  ServiceTax: number;
  IsAC: boolean;
  IsSleeper: boolean;
  BoardingPoints: BoardingPoint[];
  DroppingPoints: DroppingPoint[];
  CancellationPolicy?: CancellationPolicyRule[];
}

// ---------------------------------------------------------------------------
// Seat Chart Layout
// ---------------------------------------------------------------------------

export interface SeatLayoutItem {
  seq_no: number;
  seat_no: string;
  seat_type: number; // 1: Seater, 2: Sleeper, 4: Semi Sleeper
  deck: number; // 1: Lower, 2: Upper
  row: number;
  column: number;
  length: number;
  width: number;
  seat_status: number; // 0: Booked/unavailable, 1: Available, 2: Male, 3: Female, -2: Booked M, -3: Booked F
  base_fare: number;
  total_fare: number;
  service_tax: number;
}

export interface SeatChartResponse {
  BusId: number;
  TotalSeats: number;
  AvailableSeats: number;
  Layout: SeatLayoutItem[];
  BoardingPoints: BoardingPoint[];
  DroppingPoints: DroppingPoint[];
  CancellationPolicy: CancellationPolicyRule[];
  BusTypeName?: string;
  CompanyName?: string;
  DepartureTime?: string;
  ArrivalTime?: string;
}

// ---------------------------------------------------------------------------
// Hold & Booking
// ---------------------------------------------------------------------------

export interface PassengerInput {
  seatNo: string;
  seatTypeId: number;
  fare: number;
  gender: 'M' | 'F';
  age: number;
  name: string;
  isAcSeat: boolean;
}

export interface HoldSeatsPayload {
  fromCityId: number;
  toCityId: number;
  journeyDate: string; // YYYY-MM-DD
  busId: number;
  pickupId: string;
  dropoffId: string;
  contactInfo: {
    customerName: string;
    email: string;
    phone: string;
    mobile: string;
  };
  gstDetails?: {
    gstin: string;
    gstCompany: string;
  };
  passengers: PassengerInput[];
}

export interface HoldSeatsResponse {
  holdId: string;
  providerHoldId: string;
  expiresAt: string;
  totalFare: number;
  expiryMinutes?: number;
}

export interface CreateBookingPayload {
  holdId?: string | null;
  fromCityId: number;
  toCityId: number;
  fromCityName: string;
  toCityName: string;
  journeyDate: string;
  busId: number;
  tripId: string;
  pickupCode: string;
  pickupLocation: string;
  pickupTime: string;
  dropoffCode: string;
  dropoffLocation: string;
  dropoffTime: string;
  operatorName: string;
  busType: string;
  totalFare: number;
  baseFare: number;
  serviceTax: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  passengers: PassengerInput[];
  cancellationPolicy?: CancellationPolicyRule[];
  pickupSnapshot?: unknown;
  dropoffSnapshot?: unknown;
}

export interface BookingPassenger {
  id: string;
  seatNumber?: string;
  seatNo?: string;
  passengerName?: string;
  name?: string;
  gender: string;
  age: number | string;
  fare: number | string;
  isAcSeat?: boolean;
}

export interface BookingSeat {
  id: string;
  seatNo: string;
  seatTypeId?: number;
  fareTotal?: number | string;
}

export interface CommissionSnapshot {
  id: string;
  bookingId: string;
  agentId: string;
  grossFare: number | string;
  commissionRate: number | string;
  commissionAmt: number | string;
  netFare: number | string;
  reversalAmt?: number | string | null;
  isReversed: boolean;
  createdAt: string;
}

export interface TicketDetails {
  id: string;
  bookingId: string;
  ticketNumber: string;
  pnrNumber?: string | null;
  pdfUrl?: string | null;
  issuedAt: string;
  qrCodeUrl?: string | null;
}

export interface BookingRecord {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  userId?: string | null;
  agentId?: string | null;
  userType: 'CUSTOMER' | 'AGENT';
  providerName: string;
  providerHoldId?: string | null;
  providerPnrNo?: string | null;
  providerTicketNo?: string | null;
  fromCityId: number;
  toCityId: number;
  fromCityName: string;
  toCityName: string;
  journeyDate: string;
  pickupCode: string;
  pickupLocation: string;
  pickupTime: string;
  dropoffCode: string;
  dropoffLocation: string;
  dropoffTime: string;
  busId: number;
  operatorName: string;
  busType: string;
  baseFare: number | string;
  serviceTax: number | string;
  totalFare: number | string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  cancellationPolicy?: CancellationPolicyRule[] | null;
  passengers?: BookingPassenger[];
  seats?: BookingSeat[];
  ticket?: TicketDetails | null;
  commissionSnapshot?: CommissionSnapshot | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Financial Ledger & Wallet Statement
// ---------------------------------------------------------------------------

export interface LedgerEntry {
  id: string;
  agentId?: string | null;
  bookingId?: string | null;
  topupId?: string | null;
  cancellationId?: string | null;
  refundId?: string | null;
  type?: string;
  debitAmount?: number | string;
  creditAmount?: number | string;
  entryType: 'DEBIT' | 'CREDIT';
  accountType: 'CASH_BALANCE' | 'CREDIT_LIMIT' | 'COMMISSION_PAYABLE' | 'REFUND_RECEIVABLE' | string;
  amount: number | string;
  balanceAfter?: number | string;
  currency?: string;
  description: string;
  referenceId?: string | null;
  postedAt: string;
}

export interface WalletStatementResponse {
  entries: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface WalletTopupInitiatePayload {
  amount: number;
  gateway?: 'RAZORPAY' | 'PHONEPE' | 'AUTO';
  redirectUrl?: string;
  idempotencyKey?: string;
}

export interface WalletTopupInitiateResponse {
  topup: {
    id: string;
    agentId: string;
    amount: number | string;
    status: TopupStatus;
    merchantTxnId: string;
    createdAt: string;
  };
  gateway: string;
  checkoutUrl?: string;
  upiIntentUrl?: string;
  sdkPayload?: unknown;
  merchantTxnId: string;
  isIdempotent: boolean;
}

export interface CommissionSnapshotItem {
  id: string;
  bookingId: string;
  bookingNumber?: string;
  providerPnrNo?: string;
  operatorName?: string;
  route?: string;
  travelDate?: string;
  bookingStatus?: string;
  grossFare: number;
  baseFareForCommission: number;
  commissionRate: number;
  commissionAmt: number;
  netFare: number;
  reversedAt?: string | null;
  reversalAmt?: number | null;
  createdAt: string;
}

export interface CommissionSummary {
  totalCommission: number;
  reversedCommission: number;
  netCommission: number;
  count: number;
  snapshots?: CommissionSnapshotItem[];
}

// ---------------------------------------------------------------------------
// Cancellations & Refunds
// ---------------------------------------------------------------------------

export interface CancellabilityCheckResult {
  bookingId?: string;
  bookingNumber?: string;
  ticketNo?: string;
  pnrNo?: string;
  seatNos?: string | string[];
  IsCancellable: boolean;
  ChargePct?: number;
  ChargeAmt?: number;
  TotalFare?: number;
  CancSeatsTotalFare?: number;
  RefundPercentage?: number;
  CancellationCharge?: number;
  RefundAmount: number;
  Message?: string;
}

export interface CancelBookingResponse {
  bookingId?: string;
  status?: string;
  refundAmount?: number;
  cancellationCharge?: number;
  netRefundToAgent?: number;
  walletCredited?: boolean;
  message?: string;
  cancellation?: {
    id: string;
    bookingId: string;
    status: string;
    refundAmount: number;
    chargeAmt: number;
    seatNos: string[];
  };
  refund?: {
    id: string;
    amount: number;
    status: string;
    destination: string;
  };
}
