'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Tags,
  Wallet,
  CreditCard,
  AlertTriangle,
  HeadphonesIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navSections = [
  {
    label: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { href: '/vendors', label: 'Vendors', icon: Store, disabled: true },
      { href: '/categories', label: 'Categories', icon: Tags, disabled: true },
      { href: '/support', label: 'Support', icon: HeadphonesIcon, disabled: true },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/finance', label: 'Finance', icon: Wallet, disabled: true },
      { href: '/payouts', label: 'Payouts', icon: CreditCard, disabled: true },
      { href: '/disputes', label: 'Disputes', icon: AlertTriangle, disabled: true },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/settings', label: 'Settings', icon: Settings, disabled: true }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground shadow-sm">
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
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, disabled }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const content = (
                  <>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {!collapsed && disabled && (
                      <span className="ml-auto rounded-[var(--radius-sm)] bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </>
                );

                const className = cn(
                  'flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                  disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent hover:text-muted-foreground',
                  collapsed && 'justify-center px-2'
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

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
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
