import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        secondary:
          'bg-slate-700 text-slate-300 border border-slate-600',
        success:
          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning:
          'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        destructive:
          'bg-red-500/20 text-red-300 border border-red-500/30',
        outline: 'text-slate-300 border border-slate-600',
        level1:
          'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        level2:
          'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        level3:
          'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


