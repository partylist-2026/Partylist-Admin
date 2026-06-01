import type { Metadata } from 'next';
import { getEscrowOverview, getWalletRules, getWalletSummary, getWalletTransactions, getCommissionConfig } from '@/lib/api/wallet';
import { listCategories } from '@/lib/api/categories';
import { WalletCashbackControlView } from '@/components/finance/wallet-cashback-control-view';

export const metadata: Metadata = {
  title: 'Wallet & Cashback Control',
};

const emptyCommission = {
  defaultCommissionPercent: 0,
  vendorOverrides: [],
  categoryOverrides: [],
};

const emptyTransactions = {
  transactions: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
};

export default async function FinancePage() {
  const results = await Promise.allSettled([
    getWalletSummary(),
    getEscrowOverview(),
    getWalletTransactions({ page: 1, limit: 20 }),
    getWalletRules({ page: 1, limit: 20, isActive: true }),
    getCommissionConfig(),
    listCategories(),
  ]);

  const rejected = results.find((r) => r.status === 'rejected');
  const loadError = rejected
    ? rejected.reason instanceof Error
      ? rejected.reason.message
      : 'Failed to load finance dashboard data'
    : null;

  const summary = results[0].status === 'fulfilled' ? results[0].value : {
    totalCreditsIssued: 0,
    totalDebitsIssued: 0,
    totalActiveBalanceAcrossUsers: 0,
    totalExpiringSoon: 0,
    activeCashbackRules: 0,
    last30DaysCredit: 0,
    last30DaysDebit: 0,
    cashbackAwarded30d: 0,
    pendingReversalCount: 0,
  };

  const escrow =
    results[1].status === 'fulfilled'
      ? results[1].value
      : {
          totalEscrowBalance: 0,
          totalVendorPendingBalances: 0,
          totalPlatformCommissionHeld: 0,
          totalRefundPendingAmount: 0,
        };

  const transactions = results[2].status === 'fulfilled' ? results[2].value : emptyTransactions;
  const ruleList = results[3].status === 'fulfilled' ? results[3].value : { rules: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  const commission = results[4].status === 'fulfilled' ? results[4].value : emptyCommission;
  const categories = results[5].status === 'fulfilled' ? results[5].value : [];

  return (
    <WalletCashbackControlView
      initialSummary={summary}
      initialEscrow={escrow}
      initialTransactions={transactions}
      initialRules={ruleList.rules}
      initialCommission={commission}
      categories={categories}
      initialLoadError={loadError}
    />
  );
}
