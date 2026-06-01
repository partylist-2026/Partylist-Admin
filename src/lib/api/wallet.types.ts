export type WalletLedgerType = 'CREDIT' | 'DEBIT';

export interface WalletSummary {
  totalCreditsIssued: number;
  totalDebitsIssued: number;
  totalActiveBalanceAcrossUsers: number;
  totalExpiringSoon: number;
  activeCashbackRules: number;
  last30DaysCredit: number;
  last30DaysDebit: number;
  cashbackAwarded30d: number;
  pendingReversalCount: number;
}

export interface EscrowOverview {
  totalEscrowBalance: number;
  totalVendorPendingBalances: number;
  totalPlatformCommissionHeld: number;
  totalRefundPendingAmount: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string | null;
  orderDisplayId: string | null;
  type: WalletLedgerType;
  source: string;
  creditType: string | null;
  amount: number;
  reason: string | null;
  description: string | null;
  referenceId: string | null;
  reversedFromId: string | null;
  createdAt: string;
  isReversible: boolean;
  isReversed: boolean;
}

export interface WalletTransactionList {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletTransactionParams {
  search?: string;
  userId?: string;
  type?: WalletLedgerType;
  source?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface WalletAdjustInput {
  userId: string;
  type: WalletLedgerType;
  amount: number;
  reason: string;
}

export interface WalletRule {
  id: string;
  name: string;
  type: string;
  percentageReward: number | null;
  fixedReward: number | null;
  maxReward: number | null;
  minimumOrderAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletRuleList {
  rules: WalletRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommissionConfig {
  defaultCommissionPercent: number;
  vendorOverrides: Array<{ vendorId: string; percent: number }>;
  categoryOverrides: Array<{ categoryId: string; percent: number }>;
}

export interface WalletRuleMutationInput {
  name: string;
  type: string;
  percentageReward?: number;
  fixedReward?: number;
  maxReward?: number;
  minimumOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  isActive?: boolean;
}
