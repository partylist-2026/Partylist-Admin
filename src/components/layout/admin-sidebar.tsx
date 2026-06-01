'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  Wallet,
  CreditCard,
  HeadphonesIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
  badgeCount?: number;
};

const navSections: Array<{
  label: string;
  items: NavItem[];
}> = [
  {
    label: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { href: '/users', label: 'Users', icon: Users },
      { href: '/vendors', label: 'Vendors', icon: Store },
      { href: '/orders', label: 'Orders', icon: ShoppingBag, disabled: true },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/finance', label: 'Payments', icon: Wallet },
      { href: '/payouts', label: 'Payouts & Refunds', icon: CreditCard },
      { href: '/refunds', label: 'Refunds & Disputes', icon: ShieldAlert },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/support', label: 'Support', icon: HeadphonesIcon, disabled: true },
      { href: '/settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
];

interface AdminSidebarProps {
  ordersBadgeCount?: number;
}

export function AdminSidebar({ ordersBadgeCount }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sections = navSections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.href === '/orders' && ordersBadgeCount !== undefined && ordersBadgeCount > 0
        ? { ...item, badgeCount: ordersBadgeCount }
        : item
    ),
  }));

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary text-primary-foreground shadow-sm">
          <span className="text-xs font-bold">P</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Partylist</p>
            <p className="truncate text-xs text-muted-foreground">Admin Console</p>
          </div>
        )}
      </div>

      <nav className="dashboard-scroll flex-1 space-y-6 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, disabled, badgeCount }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);

                const className = cn(
                  'sidebar-nav-item',
                  active && 'is-active',
                  disabled && 'is-disabled',
                  collapsed && 'justify-center px-2'
                );

                const content = (
                  <>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {!collapsed && badgeCount !== undefined && badgeCount > 0 && (
                      <span className="badge-warning" aria-label={`${badgeCount} pending orders`}>
                        {badgeCount}
                      </span>
                    )}
                    {!collapsed && disabled && !badgeCount && (
                      <span className="ml-auto rounded-[var(--radius-sm)] bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={href}>
                    {disabled ? (
                      <span className={className} aria-disabled="true">
                        {content}
                      </span>
                    ) : (
                      <Link href={href} className={className}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-[var(--radius-md)] border border-border bg-muted/50 p-3">
          <p className="text-xs font-medium text-foreground">Need help?</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Review Partylist admin documentation for vendor workflows.
          </p>
        </div>
      )}

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="sidebar-nav-item justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
