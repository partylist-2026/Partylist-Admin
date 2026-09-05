export type VendorStatus = 'UNDER_REVIEW' | 'APPROVED' | 'SUSPENDED';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminVendorListItem {
  id: string;
  storeName: string;
  email: string | null;
  status: VendorStatus;
  kycStatus: KycStatus | null;
  categoryName: string | null;
  serviceCity: string | null;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface AdminVendorListResponse {
  vendors: AdminVendorListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorStats {
  total: number;
  pendingApproval: number;
  approved: number;
  suspended: number;
}

export interface ListVendorsParams {
  status?: VendorStatus;
  kycStatus?: KycStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminVendorDetail {
  id: string;
  storeName: string;
  description: string | null;
  logoPublicId: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  categoryId: string | null;
  categoryName: string | null;
  serviceCity: string | null;
  serviceRadiusKm: number | null;
  commissionRate: number;
  status: VendorStatus;
  kycStatus: KycStatus | null;
  kycData: Record<string, unknown> | null;
  suspensionReason: string | null;
  suspendedAt: string | null;
  isAvailable: boolean;
  profileVisible: boolean;
  onboardingComplete: boolean;
  averageRating: number | null;
  reviewCount: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
  ownerUser: {
    id: string;
    email: string | null;
    phone: string | null;
  };
  ledgerSummary: {
    totalEarnings: number;
    totalPaidOut: number;
    pendingBalance: number;
  };
  activeOrdersCount: number;
  completedOrdersCount: number;
  disputeCount: number;
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    institutionNumber: string;
    transitNumber: string;
    accountNumber: string;
    swiftCode: string | null;
    currency: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  supportTickets: AdminVendorSupportTicket[];
  payouts: AdminVendorPayout[];
  recentOrders: AdminVendorOrder[];
  activityLogs: AdminVendorActivityLog[];
}

export interface AdminVendorSupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVendorPayout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  processedAt: string | null;
  releasedAt: string | null;
  note: string | null;
  paymentMethod: string | null;
  transactionReference: string | null;
  holdReason: string | null;
  releasedByAdminEmail: string | null;
}

export interface AdminVendorOrder {
  id: string;
  displayId: string | null;
  status: string;
  totalAmount: number;
  customerEmail: string | null;
  createdAt: string;
}

export interface AdminVendorActivityLog {
  id: string;
  action: string;
  adminEmail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateVendorInput {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  storeName: string;
  description?: string;
  categoryId?: string;
  serviceCity?: string;
  contactEmail?: string;
  contactPhone?: string;
  autoApprove?: boolean;
}

export interface CreateVendorResponse {
  vendorId: string;
  ownerUserId: string;
  status: VendorStatus;
}

export interface VendorImpersonationResponse {
  impersonationToken: string;
  expiresAt: string;
  expiresInSeconds: number;
  vendorUserId: string;
  readOnly: true;
}
