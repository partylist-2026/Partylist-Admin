export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type UserAuditEventKind =
  | 'ORDER_PLACED'
  | 'PAYMENT'
  | 'DISPUTE'
  | 'SUPPORT_TICKET'
  | 'PROFILE_UPDATE'
  | 'ORDER_STATUS'
  | 'WALLET'
  | 'ACTIVITY';

export interface AdminUserListItem {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
}

export interface UserAuditEvent {
  id: string;
  kind: UserAuditEventKind;
  title: string;
  description?: string;
  metadata?: Record<string, string | number | null>;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalOrders: number;
    activeOrders: number;
    totalSpend: number;
    openDisputes: number;
    openTickets: number;
    walletBalance: number;
    auditLogCount: number;
  };
  auditLogs: UserAuditEvent[];
  recentOrders: Array<{
    id: string;
    displayId: string | null;
    status: string;
    totalAmount: number;
    vendorName: string;
    eventDate: string;
    createdAt: string;
    paymentStatus: string | null;
  }>;
  disputes: Array<{
    id: string;
    orderId: string;
    orderDisplayId: string | null;
    reason: string;
    status: string;
    vendorName: string;
    createdAt: string;
  }>;
  supportTickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  walletTransactions: Array<{
    id: string;
    type: 'CREDIT' | 'DEBIT';
    source: string;
    amount: number;
    reason: string | null;
    description: string | null;
    referenceOrderId: string | null;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    label: string;
    line1: string;
    city: string;
    isDefault: boolean;
  }>;
}

export function getUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email || 'User';
}
