import { Bell, Search } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { Input } from '@/components/ui/input';

interface AdminTopHeaderProps {
  email?: string | null;
  title?: string;
  description?: string;
}

export function AdminTopHeader({
  email,
  title = 'Dashboard',
  description = 'Platform overview and key metrics',
}: AdminTopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-56 pl-9"
              aria-label="Search admin"
              disabled
            />
          </div>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
            disabled
          >
            <Bell className="h-4 w-4" aria-hidden />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          </button>

          <LogoutButton email={email} />
        </div>
      </div>
    </header>
  );
}
