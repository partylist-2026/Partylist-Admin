'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import type { AdminUserListItem } from '@/lib/api/users.types';
import { getUserDisplayName } from '@/lib/api/users.types';
import { formatCurrency, formatNumber, getInitials } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UsersTableProps {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialSearch?: string;
}

export function UsersTable({ users, pagination, initialSearch = '' }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (updates.search !== undefined && !updates.page) {
      params.set('page', '1');
    }
    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  }

  return (
    <section className="admin-panel-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">All users</h2>
          <p className="text-xs text-muted-foreground">
            {formatNumber(pagination.total)} registered customers
          </p>
        </div>
        <form
          className="relative w-full sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            updateQuery({ search: search.trim() || undefined });
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="h-9 pl-9"
            aria-label="Search users"
          />
        </form>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const name = getUserDisplayName(user);
                return (
                  <TableRow key={user.id} className={isPending ? 'opacity-60' : undefined}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="truncate text-sm">{user.email ?? '—'}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.phone ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(user.totalOrders)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(user.totalSpend)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          user.status === 'ACTIVE'
                            ? 'metric-chip metric-chip-success'
                            : 'metric-chip bg-muted text-muted-foreground'
                        }
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/users/${user.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`View ${name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1 || isPending}
              onClick={() => updateQuery({ page: String(pagination.page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() => updateQuery({ page: String(pagination.page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
