export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
export type OrderStatus =
  | 'COMPLETED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | string;
export type PaymentStatus = 'SUCCEEDED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | string;
export type RaisedBy = 'USER' | 'VENDOR';

export type DisputeDashboardTab = 'ACTION_REQUIRED' | 'UNDER_REVIEW' | 'RESOLVED' | 'ALL';

export interface DisputeListItem {
  id: string;
  orderId: string;
  raisedBy: RaisedBy;
  reason: string;
  status: DisputeStatus;
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    vendor: {
      id: string;
      storeName: string;
    };
  };
  createdAt: string;
  resolvedAt: string | null;
}

export interface DisputeDashboardData {
  kpis: {
    openDisputes: number;
    pendingRefunds: number;
    avgResolutionTimeHours: number;
    amountRefunded30d: number;
  };
  cases: DisputeListItem[];
  statusBreakdown: {
    open: number;
    inReview: number;
    resolved: number;
    closed: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  activeTab: DisputeDashboardTab;
  search: string;
  refreshedAt: string;
}

export interface DisputeDetail {
  id: string;
  orderId: string;
  raisedBy: RaisedBy;
  raisedByUserId: string | null;
  raisedByVendorId: string | null;
  reason: string;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    platformFee: number;
    vendorAmount: number;
    vendor: {
      id: string;
      storeName: string;
      ownerUserId: string;
    };
    payment: {
      id: string;
      status: PaymentStatus;
      amount: number;
      stripePaymentIntent: string | null;
    } | null;
  };
}

export interface DisputeDashboardParams {
  tab?: DisputeDashboardTab;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResolveDisputeInput {
  decision: 'APPROVE' | 'REJECT';
  adminNote: string;
}

export interface ConfirmRefundInput {
  stripeReference: string;
}
