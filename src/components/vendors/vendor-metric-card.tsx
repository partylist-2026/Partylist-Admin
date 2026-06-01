import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorMetricCardProps {
  title: string;
  value: string;
  chip?: { label: string; tone: 'success' | 'warning' | 'destructive' };
  icon: LucideIcon;
  iconWrapClassName?: string;
}

const chipClass: Record<NonNullable<VendorMetricCardProps['chip']>['tone'], string> = {
  success: 'metric-chip-success',
  warning: 'metric-chip-warning',
  destructive: 'metric-chip-destructive',
};

export function VendorMetricCard({
  title,
  value,
  chip,
  icon: Icon,
  iconWrapClassName,
}: VendorMetricCardProps) {
  return (
    <article className="admin-panel-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="metric-value text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {chip && (
            <span className={cn('metric-chip', chipClass[chip.tone])}>{chip.label}</span>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-secondary-foreground',
            iconWrapClassName
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </article>
  );
}
