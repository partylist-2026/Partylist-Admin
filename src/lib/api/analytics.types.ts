export interface AdminAnalyticsOverview {
  totalUsers: number;
  totalVendors: number;
  activeVendors: number;
  totalOrders: number;
  completedOrders: number;
  grossRevenue: number;
  platformCommission: number;
  totalRefundAmount: number;
  netRevenue: number;
  walletCreditsIssued: number;
  walletDebitsIssued: number;
}

export interface AdminAnalyticsRevenueTrend {
  labels: string[];
  grossRevenueSeries: number[];
  netRevenueSeries: number[];
  refundSeries: number[];
}

export interface AdminAnalyticsOrderTrends {
  totalOrders: number;
  statusBreakdown: Record<string, number>;
  avgOrderValue: number;
  avgSettlementTimeHours: number;
}

export interface AdminAnalyticsVendorPerformance {
  vendorId: string;
  storeName: string;
  totalRevenue: number;
  totalOrders: number;
  avgRating: number;
  refundRate: number;
  disputeRate: number;
  settlementRate: number;
  payoutRatio: number;
}

export interface AdminAnalyticsRisk {
  highRefundVendors: Array<{ vendorId: string; storeName: string; refundRate: number }>;
  highDisputeUsers: Array<{ userId: string; email: string | null; disputeCount: number }>;
  vendorsWithLateSettlement: Array<{ vendorId: string; storeName: string; orderId: string }>;
  highWalletAdjustmentAdmins: Array<{ adminId: string; userId: string; adjustmentCount: number }>;
  suspiciousOrderClusters: Array<{ userId: string; orderCount: number; totalAmount: number }>;
}

export interface DashboardOverviewData {
  overview: AdminAnalyticsOverview | null;
  revenueTrend: AdminAnalyticsRevenueTrend | null;
  orderTrends: AdminAnalyticsOrderTrends | null;
  topVendors: AdminAnalyticsVendorPerformance[];
  risk: AdminAnalyticsRisk | null;
  errors: string[];
}
