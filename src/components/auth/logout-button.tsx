'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
  email?: string | null;
}

export function LogoutButton({ email }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {email && (
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Sign out"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden />
        )}
        Sign out
      </Button>
    </div>
  );
}
