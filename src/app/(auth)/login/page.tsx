import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Sparkles, Shield, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign in',
};

const highlights = [
  {
    icon: Shield,
    title: 'Vendor governance',
    description: 'Approve, suspend, and review KYC in one workflow.',
  },
  {
    icon: BarChart3,
    title: 'Finance visibility',
    description: 'Track payouts, disputes, and platform revenue live.',
  },
  {
    icon: Sparkles,
    title: 'Operational control',
    description: 'Categories, support tickets, and system configuration.',
  },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="login-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="login-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row">
        {/* Brand panel */}
        <section className="relative flex flex-1 flex-col justify-between px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-primary text-primary-foreground shadow-sm">
                <span className="text-sm font-bold tracking-tight">P</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Partylist</p>
                <p className="text-xs text-muted-foreground">Administration</p>
              </div>
            </div>
          </div>

          <div className="my-10 hidden max-w-md lg:block">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-secondary-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              Platform control center
            </div>
            <h1 className="text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-foreground">
              Run your marketplace with clarity and confidence.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The Partylist admin console gives your team a single, secure place to
              manage vendors, monitor finances, and keep operations moving.
            </p>

            <ul className="mt-10 space-y-4">
              {highlights.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-secondary-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden text-xs text-muted-foreground lg:block">
            © {new Date().getFullYear()} Partylist. Internal use only.
          </p>
        </section>

        {/* Form panel */}
        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:border-l lg:border-border lg:bg-card/40 lg:px-12 lg:backdrop-blur-sm">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
