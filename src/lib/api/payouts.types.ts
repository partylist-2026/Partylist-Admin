export type VendorPayoutEligibility = 'ELIGIBLE' | 'COOLDOWN' | 'UNDER_REVIEW' | 'BLOCKED';
export type VendorDisputeState = 'OPEN' | 'SORTED' | 'NONE';

export const MANUAL_PAYOUT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'WIRE', label: 'Wire transfer' },
  { value: 'ACH', label: 'ACH' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHECK', label: 'Check' },
  { value: 'CASH', label: 'Cash' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type ManualPayoutMethod = (typeof MANUAL_PAYOUT_METHODS)[number]['value'];

export interface ReleasePayoutInput {
  paymentMethod: ManualPayoutMethod;
  transactionReference: string;
  note?: string;
  transferredAt?: string;
}

export interface VendorPayoutRecord {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  transactionReference: string | null;
  note: string | null;
  holdReason: string | null;
  createdAt: string;
  processedAt: string | null;
  releasedAt: string | null;
  releasedByAdminEmail: string | null;
}

export interface VendorPayoutListResponse {
  vendorId: string;
  storeName: string;
  payouts: VendorPayoutRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PayoutDashboardAlert {
  id: string;
  tone: 'warning' | 'destructive' | 'info' | 'success';
  message: string;
  createdAt: string;
}

export interface PayoutDashboardQueueItem {
  vendorId: string;
  storeName: string;
  vendorCode: string;
  pendingBalance: number;
  eligibility: VendorPayoutEligibility;
  eligibilityReason: string;
  disputeState: VendorDisputeState;
  hasBankDetails: boolean;
  openDisputeCount: number;
  lastPayoutAmount: number | null;
  lastPayoutDate: string | null;
  kycStatus: string;
  riskLabel: string;
  riskScore: number;
  pendingPayoutId: string | null;
  pendingPayoutAmount: number | null;
  holdReason: string | null;
  canRelease: boolean;
  canCreatePayoutRequest: boolean;
}

export interface PayoutDashboard {
  kpis: {
    totalEscrowBalance: number;
    vendorPendingBalances: number;
    payoutsCompleted24h: number;
    payoutsCompleted24hCount: number;
    onHoldAmount: number;
    onHoldCount: number;
    pendingPayoutCount: number;
  };
  eligibilityOverview: {
    eligible: number;
    cooldown: number;
    underReview: number;
    blocked: number;
  };
  alerts: PayoutDashboardAlert[];
  vendorQueue: PayoutDashboardQueueItem[];
  readyBatchPayoutIds: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refreshedAt: string;
}

export interface BatchReleaseResult {
  successCount: number;
  failedCount: number;
  failures: Array<{ payoutId: string; reason: string }>;
}

export interface PayoutDashboardParams {
  page?: number;
  limit?: number;
  search?: string;
}
