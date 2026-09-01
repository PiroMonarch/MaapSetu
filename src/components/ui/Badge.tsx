import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'info';
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-near-black/8 text-near-black/70 border border-near-black/10',
    success: 'bg-emerald/10 text-emerald border border-emerald/20',
    warning: 'bg-signal-orange/10 text-signal-orange border border-signal-orange/20',
    error: 'bg-red/10 text-red border border-red/20',
    info: 'bg-industrial-blue/10 text-industrial-blue border border-industrial-blue/20',
    outline: 'border border-current bg-transparent',
  };

  const dotColors = {
    default: 'bg-near-black/40',
    success: 'bg-emerald',
    warning: 'bg-signal-orange',
    error: 'bg-red',
    info: 'bg-industrial-blue',
    outline: 'bg-current',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </div>
  );
}
