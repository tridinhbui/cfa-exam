import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30',
        secondary:
          'bg-muted text-muted-foreground border border-border',
        success:
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
        warning:
          'bg-amber-500/20 text-amber-400 border border-amber-500/30 light:bg-amber-50 light:text-amber-700 light:border-amber-200',
        destructive:
          'bg-red-500/20 text-red-400 border border-red-500/30 light:bg-red-50 light:text-red-700 light:border-red-200',
        outline: 'text-muted-foreground border border-border',
        level1:
          'bg-indigo-500/10 text-indigo-600 border border-indigo-500/30',
        level2:
          'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30',
        level3:
          'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


