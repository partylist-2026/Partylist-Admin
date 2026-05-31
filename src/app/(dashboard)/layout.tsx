import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

const navItems = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground shadow-sm">
              <span className="text-xs font-bold">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Partylist Admin</p>
              <p className="text-xs text-muted-foreground">Platform control center</p>
            </div>
          </div>
          <LogoutButton email={session.user.email} />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1 rounded-[var(--radius-xl)] border border-border bg-card p-2 shadow-sm">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
