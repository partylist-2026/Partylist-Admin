import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-md)] border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        success:
          'border-transparent bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[color-mix(in_srgb,var(--success)_85%,#000)]',
        warning:
          'border-transparent bg-[color-mix(in_srgb,var(--warning)_12%,white)] text-[color-mix(in_srgb,var(--warning)_85%,#000)]',
        destructive:
          'border-transparent bg-[color-mix(in_srgb,var(--destructive)_10%,white)] text-destructive',
        outline: 'border-border bg-card text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
