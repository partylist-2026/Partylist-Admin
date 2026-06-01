'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  Clock3,
  Filter,
  Gift,
  MoreHorizontal,
  Search,
  Wallet,
} from 'lucide-react';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  CommissionConfig,
  EscrowOverview,
  WalletRule,
  WalletRuleMutationInput,
  WalletSummary,
  WalletTransaction,
  WalletTransactionList,
} from '@/lib/api/wallet.types';
import type { AdminCategory } from '@/lib/api/categories';
import { formatCurrency, formatDate, formatNumber, formatRelativeTime, getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';

type FinanceTab = 'TRANSACTION_LOGS' | 'REVERSAL_REQUESTS' | 'ARCHIVED';

interface WalletCashbackControlViewProps {
  initialSummary: WalletSummary;
  initialEscrow: EscrowOverview;
  initialTransactions: WalletTransactionList;
  initialRules: WalletRule[];
  initialCommission: CommissionConfig;
  categories: AdminCategory[];
  initialLoadError?: string | null;
}

export function WalletCashbackControlView({
  initialSummary,
  initialEscrow,
  initialTransactions,
  initialRules,
  initialCommission,
  categories,
  initialLoadError = null,
}: WalletCashbackControlViewProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [escrow, setEscrow] = useState(initialEscrow);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [rules, setRules] = useState(initialRules);
  const [commission, setCommission] = useState(initialCommission);
  const [defaultCommissionPercent, setDefaultCommissionPercent] = useState(
    String(initialCommission.defaultCommissionPercent)
  );
  const [vendorOverrideForm, setVendorOverrideForm] = useState({ vendorId: '', percent: '' });
  const [categoryOverrideForm, setCategoryOverrideForm] = useState({
    categoryId: categories[0]?.id ?? '',
    percent: '',
  });
  const [tab, setTab] = useState<FinanceTab>('TRANSACTION_LOGS');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [range, setRange] = useState<'ALL' | '30' | '7'>('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState<WalletRuleMutationInput>({
    name: '',
    type: 'ORDER_SETTLEMENT',
    percentageReward: 5,
    minimumOrderAmount: 0,
    maxReward: 0,
    priority: 0,
    isActive: true,
  });
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    amount: '',
    reason: '',
  });

  const filteredRows = useMemo(() => {
    if (tab === 'REVERSAL_REQUESTS') {
      return transactions.transactions.filter((item) => item.isReversible && !item.isReversed);
    }
    if (tab === 'ARCHIVED') {
      return transactions.transactions.filter((item) => item.isReversed);
    }
    return transactions.transactions;
  }, [tab, transactions.transactions]);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const fromDate =
          range === 'ALL'
            ? undefined
            : new Date(now.getTime() - Number(range) * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
        const params = new URLSearchParams({
          page: String(page),
          limit: String(transactions.pagination.limit || 20),
        });
        if (search.trim()) params.set('search', search.trim());
        if (source.trim()) params.set('source', source);
        if (fromDate) params.set('fromDate', fromDate);
        if (tab === 'REVERSAL_REQUESTS' || tab === 'ARCHIVED') {
          params.set('source', 'ADMIN');
        }

        const [summaryRes, escrowRes, txRes] = await Promise.all([
          fetch('/api/admin/wallet/summary', { cache: 'no-store' }),
          fetch('/api/admin/finance/escrow', { cache: 'no-store' }),
          fetch(`/api/admin/wallet/transactions?${params.toString()}`, { cache: 'no-store' }),
        ]);
        const [summaryBody, escrowBody, txBody] = await Promise.all([
          summaryRes.json(),
          escrowRes.json(),
          txRes.json(),
        ]);
        if (!summaryRes.ok || !summaryBody.success) throw new Error(summaryBody.error ?? 'Wallet summary failed');
        if (!escrowRes.ok || !escrowBody.success) throw new Error(escrowBody.error ?? 'Escrow load failed');
        if (!txRes.ok || !txBody.success) throw new Error(txBody.error ?? 'Transactions load failed');

        setSummary(summaryBody.data as WalletSummary);
        setEscrow(escrowBody.data as EscrowOverview);
        setTransactions(txBody.data as WalletTransactionList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    },
    [range, search, source, tab, transactions.pagination.limit]
  );

  async function openRules() {
    setRulesOpen(true);
    try {
      const res = await fetch('/api/admin/wallet/rules?isActive=true&limit=20', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Rules load failed');
      setRules((body.data?.rules ?? []) as WalletRule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cashback rules');
    }
  }

  async function saveCommissionConfig() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload: CommissionConfig = {
        defaultCommissionPercent: Number(defaultCommissionPercent) || 0,
        vendorOverrides: commission.vendorOverrides,
        categoryOverrides: commission.categoryOverrides,
      };
      const res = await fetch('/api/admin/system/commission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to update commission config');
      setCommission(body.data as CommissionConfig);
      setMessage('Commission rules updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update commission config');
    } finally {
      setLoading(false);
    }
  }

  function addVendorOverride() {
    const percent = Number(vendorOverrideForm.percent);
    if (!vendorOverrideForm.vendorId.trim() || !Number.isFinite(percent) || percent < 0 || percent > 100) {
      setError('Vendor ID and commission percent (0-100) are required.');
      return;
    }
    setCommission((prev) => ({
      ...prev,
      vendorOverrides: [
        ...prev.vendorOverrides.filter((v) => v.vendorId !== vendorOverrideForm.vendorId.trim()),
        { vendorId: vendorOverrideForm.vendorId.trim(), percent },
      ],
    }));
    setVendorOverrideForm({ vendorId: '', percent: '' });
  }

  function addCategoryOverride() {
    const percent = Number(categoryOverrideForm.percent);
    if (!categoryOverrideForm.categoryId || !Number.isFinite(percent) || percent < 0 || percent > 100) {
      setError('Category and commission percent (0-100) are required.');
      return;
    }
    setCommission((prev) => ({
      ...prev,
      categoryOverrides: [
        ...prev.categoryOverrides.filter((v) => v.categoryId !== categoryOverrideForm.categoryId),
        { categoryId: categoryOverrideForm.categoryId, percent },
      ],
    }));
    setCategoryOverrideForm((prev) => ({ ...prev, percent: '' }));
  }

  async function createRule() {
    if (!ruleForm.name?.trim()) {
      setError('Rule name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: ruleForm.name.trim(),
        type: ruleForm.type ?? 'ORDER_SETTLEMENT',
        isActive: ruleForm.isActive ?? true,
        priority: ruleForm.priority ?? 0,
      };
      if (ruleForm.percentageReward != null) payload.percentageReward = Number(ruleForm.percentageReward);
      if (ruleForm.fixedReward != null) payload.fixedReward = Number(ruleForm.fixedReward);
      if (ruleForm.minimumOrderAmount != null) payload.minimumOrderAmount = Number(ruleForm.minimumOrderAmount);
      if (ruleForm.maxReward != null) payload.maxReward = Number(ruleForm.maxReward);
      if (ruleForm.startDate) payload.startDate = ruleForm.startDate;
      if (ruleForm.endDate) payload.endDate = ruleForm.endDate;

      const res = await fetch('/api/admin/wallet/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to create wallet rule');
      setCreateRuleOpen(false);
      setMessage('Cashback rule created.');
      await openRules();
      await fetchData(transactions.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create wallet rule');
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(rule: WalletRule) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wallet/rules/${rule.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Failed to toggle rule');
      await openRules();
      await fetchData(transactions.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not toggle wallet rule');
    } finally {
      setLoading(false);
    }
  }

  async function submitAdjustment() {
    setError(null);
    setMessage(null);
    const amount = Number(adjustForm.amount);
    if (!adjustForm.userId.trim() || !Number.isFinite(amount) || amount <= 0 || !adjustForm.reason.trim()) {
      setError('User ID, amount and reason are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallet/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adjustForm.userId.trim(),
          type: adjustForm.type,
          amount,
          reason: adjustForm.reason.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Wallet adjustment failed');
      setAdjustOpen(false);
      setAdjustForm({ userId: '', type: 'CREDIT', amount: '', reason: '' });
      setMessage('Wallet balance adjusted successfully.');
      await fetchData(transactions.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust wallet balance');
    } finally {
      setLoading(false);
    }
  }

  async function reverseTransaction(txn: WalletTransaction) {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wallet/reverse/${txn.id}`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error ?? 'Reverse action failed');
      setMessage(`Transaction ${txn.id.slice(0, 8)} reversed.`);
      await fetchData(transactions.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reverse transaction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-scroll space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet &amp; Cashback Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage wallet balances, review transaction logs, and configure cashback rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={openRules}>
            <Gift className="h-4 w-4" />
            Cashback Rules
          </Button>
          <Button type="button" size="sm" className="btn-primary-gradient" onClick={() => setAdjustOpen(true)}>
            <Wallet className="h-4 w-4" />
            Credit / Debit Balance
          </Button>
        </div>
      </header>

      {(initialLoadError || error) && (
        <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive-foreground)]">
          {initialLoadError ?? error}
        </div>
      )}
      {message && (
        <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-foreground)]">
          {message}
        </div>
      )}

      <div className="metrics-grid">
        <VendorMetricCard
          title="Customer Wallet Balance"
          value={formatCurrency(summary.totalActiveBalanceAcrossUsers)}
          chip={{ label: `+${formatNumber(summary.last30DaysCredit)} entries`, tone: 'success' }}
          icon={Wallet}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-primary"
        />
        <VendorMetricCard
          title="Vendor Escrow Balance"
          value={formatCurrency(escrow.totalVendorPendingBalances)}
          chip={{ label: 'Held in escrow', tone: 'warning' }}
          icon={ArrowDownCircle}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-warning"
        />
        <VendorMetricCard
          title="Cashback Awarded (30d)"
          value={formatCurrency(summary.cashbackAwarded30d)}
          chip={{ label: `${summary.activeCashbackRules} active rules`, tone: 'success' }}
          icon={Gift}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
        />
        <VendorMetricCard
          title="Pending Reversals"
          value={formatNumber(summary.pendingReversalCount)}
          chip={{ label: 'Admin review', tone: 'destructive' }}
          icon={Clock3}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive"
        />
      </div>

      <section className="admin-panel-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Commission &amp; Pricing Rules</h2>
            <p className="text-xs text-muted-foreground">
              Set global commission, vendor-specific overrides, and category commission rules.
            </p>
          </div>
          <Button type="button" size="sm" className="btn-primary-gradient" onClick={saveCommissionConfig} disabled={loading}>
            Save Commission Settings
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Global commission</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultCommissionPercent}
                onChange={(e) => setDefaultCommissionPercent(e.target.value)}
                className="max-w-[160px]"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Vendor override</p>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
              <Input
                value={vendorOverrideForm.vendorId}
                onChange={(e) => setVendorOverrideForm((v) => ({ ...v, vendorId: e.target.value }))}
                placeholder="Vendor UUID"
              />
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={vendorOverrideForm.percent}
                onChange={(e) => setVendorOverrideForm((v) => ({ ...v, percent: e.target.value }))}
                placeholder="%"
              />
              <Button type="button" variant="outline" onClick={addVendorOverride}>
                Add
              </Button>
            </div>
            <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
              {commission.vendorOverrides.map((item) => (
                <li key={item.vendorId} className="flex items-center justify-between rounded border border-border px-2 py-1">
                  <span className="truncate">{item.vendorId}</span>
                  <span className="font-medium text-foreground">{item.percent}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-[var(--radius-md)] border border-border p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Category override</p>
            <div className="grid gap-2 sm:grid-cols-[220px_120px_auto]">
              <select
                value={categoryOverrideForm.categoryId}
                onChange={(e) => setCategoryOverrideForm((v) => ({ ...v, categoryId: e.target.value }))}
                className="h-10 rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={categoryOverrideForm.percent}
                onChange={(e) => setCategoryOverrideForm((v) => ({ ...v, percent: e.target.value }))}
                placeholder="%"
              />
              <Button type="button" variant="outline" onClick={addCategoryOverride}>
                Add
              </Button>
            </div>
            <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              {commission.categoryOverrides.map((item) => (
                <li key={item.categoryId} className="flex items-center justify-between rounded border border-border px-2 py-1">
                  <span>
                    {categories.find((cat) => cat.id === item.categoryId)?.name ?? item.categoryId}
                  </span>
                  <span className="font-medium text-foreground">{item.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="admin-panel-card overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'TRANSACTION_LOGS', label: 'Transaction Logs' },
                { id: 'REVERSAL_REQUESTS', label: 'Reversal Requests' },
                { id: 'ARCHIVED', label: 'Archived' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id as FinanceTab);
                    void fetchData(1);
                  }}
                  className={cn(
                    'rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-colors',
                    tab === item.id ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fetchData(transactions.pagination.page)}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_130px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, reference, reason..."
                className="h-9 pl-9"
              />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="h-9 rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="">Type: All</option>
              <option value="ORDER">Order</option>
              <option value="CASHBACK">Cashback</option>
              <option value="REFUND">Refund</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex items-center gap-2">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as 'ALL' | '30' | '7')}
                className="h-9 flex-1 rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="30">Last 30 Days</option>
                <option value="7">Last 7 Days</option>
                <option value="ALL">All Time</option>
              </select>
              <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchData(1)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">TXN ID &amp; Date</th>
                <th className="px-3 py-3">Account</th>
                <th className="px-3 py-3">Transaction Type</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="px-3 py-3">Balance After</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No wallet transactions match your filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">WTX-{item.id.slice(0, 6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)} • {formatRelativeTime(item.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                          {getInitials(item.userName ?? item.userId)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{item.userName ?? item.userId}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.orderDisplayId ?? 'No order'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="metric-chip metric-chip-warning">{item.source}</span>
                      {item.creditType && (
                        <p className="mt-1 text-xs text-muted-foreground">{item.creditType.replaceAll('_', ' ')}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn('font-semibold', item.type === 'CREDIT' ? 'text-[var(--success)]' : 'text-destructive')}>
                        {item.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">—</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'metric-chip',
                          item.isReversed
                            ? 'metric-chip-success'
                            : item.isReversible
                              ? 'metric-chip-warning'
                              : 'metric-chip-success'
                        )}
                      >
                        {item.isReversed ? 'Reversed' : item.isReversible ? 'Pending' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {item.isReversible && !item.isReversed ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => reverseTransaction(item)}
                          disabled={loading}
                        >
                          Reverse
                        </Button>
                      ) : (
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground">
            Showing {formatNumber(filteredRows.length)} of {formatNumber(transactions.pagination.total)} entries
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading || transactions.pagination.page <= 1}
              onClick={() => fetchData(transactions.pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="inline-flex items-center px-2 text-xs text-muted-foreground">
              {transactions.pagination.page} / {transactions.pagination.totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading || transactions.pagination.page >= transactions.pagination.totalPages}
              onClick={() => fetchData(transactions.pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </footer>
      </section>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent onClose={() => setAdjustOpen(false)}>
          <DialogHeader>
            <DialogTitle>Adjust wallet balance</DialogTitle>
            <DialogDescription>
              Create an auditable manual credit or debit entry for a user wallet.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">User ID</p>
              <Input
                value={adjustForm.userId}
                onChange={(e) => setAdjustForm((v) => ({ ...v, userId: e.target.value }))}
                placeholder="Paste user UUID"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Type</p>
                <select
                  value={adjustForm.type}
                  onChange={(e) =>
                    setAdjustForm((v) => ({ ...v, type: e.target.value as 'CREDIT' | 'DEBIT' }))
                  }
                  className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground"
                >
                  <option value="CREDIT">Credit</option>
                  <option value="DEBIT">Debit</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Amount</p>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm((v) => ({ ...v, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Reason</p>
              <Input
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((v) => ({ ...v, reason: e.target.value }))}
                placeholder="Reason for this adjustment"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="btn-primary-gradient" onClick={submitAdjustment} disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent onClose={() => setRulesOpen(false)}>
          <DialogHeader>
            <DialogTitle>Active Cashback Rules</DialogTitle>
            <DialogDescription>
              Manage reward rules used by order settlement credits and cashback campaigns.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="pb-0">
            <Button type="button" className="btn-primary-gradient" size="sm" onClick={() => setCreateRuleOpen(true)}>
              <Gift className="h-4 w-4" />
              Create Rule
            </Button>
          </DialogBody>
          <DialogBody>
            {rules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active cashback rules.</p>
            ) : (
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li key={rule.id} className="rounded-[var(--radius-md)] border border-border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => toggleRule(rule)}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rule.percentageReward != null ? `${rule.percentageReward}%` : null}
                      {rule.fixedReward != null ? ` • ${formatCurrency(rule.fixedReward)}` : null}
                      {rule.maxReward != null ? ` • Max ${formatCurrency(rule.maxReward)}` : null}
                      {rule.minimumOrderAmount != null
                        ? ` • Min order ${formatCurrency(rule.minimumOrderAmount)}`
                        : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRulesOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
        <DialogContent onClose={() => setCreateRuleOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create cashback rule</DialogTitle>
            <DialogDescription>Define a reward rule that admins can activate for order settlement.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <Input
              value={ruleForm.name ?? ''}
              onChange={(e) => setRuleForm((v) => ({ ...v, name: e.target.value }))}
              placeholder="Rule name"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={ruleForm.percentageReward ?? ''}
                onChange={(e) =>
                  setRuleForm((v) => ({ ...v, percentageReward: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
                placeholder="Reward %"
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={ruleForm.minimumOrderAmount ?? ''}
                onChange={(e) =>
                  setRuleForm((v) => ({ ...v, minimumOrderAmount: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
                placeholder="Min order amount"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={ruleForm.maxReward ?? ''}
                onChange={(e) =>
                  setRuleForm((v) => ({ ...v, maxReward: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
                placeholder="Max reward"
              />
              <Input
                type="number"
                min="-32768"
                max="32767"
                value={ruleForm.priority ?? 0}
                onChange={(e) =>
                  setRuleForm((v) => ({ ...v, priority: e.target.value === '' ? 0 : Number(e.target.value) }))
                }
                placeholder="Priority"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateRuleOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="btn-primary-gradient" onClick={createRule} disabled={loading}>
              {loading ? 'Creating...' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
