'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body?.error ?? 'Invalid email or password');
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 lg:hidden">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-secondary-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Admin console
        </div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
          Sign in to Partylist
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Manage vendors, orders, payouts, and platform settings from one place.
        </p>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[0_1px_2px_rgba(11,19,32,0.04),0_12px_32px_rgba(11,19,32,0.06)] sm:p-8">
        <div className="mb-6 hidden lg:block">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@partylist.com"
                className="pl-10"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pl-10"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--destructive)_25%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_8%,white)] px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button type="submit" className="group w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Signing in...
              </>
            ) : (
              <>
                Continue to dashboard
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Authorized personnel only. All sign-in activity is logged and monitored.
        </p>
      </div>
    </div>
  );
}
