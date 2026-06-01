import { Search } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/lib/format';

interface AdminTopHeaderProps {
  email?: string | null;
}

export function AdminTopHeader({ email }: AdminTopHeaderProps) {
  const displayName = email?.split('@')[0] ?? 'Admin';
  const roleLabel = 'Admin';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search users, vendors, orders..."
            className="h-9 pl-9"
            aria-label="Global search"
            disabled
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium capitalize text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
          <LogoutButton email={email} />
        </div>
      </div>
    </header>
  );
}
