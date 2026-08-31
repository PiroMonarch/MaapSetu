import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-black/5 text-near-black',
    success: 'bg-emerald/10 text-emerald',
    warning: 'bg-signal-orange/10 text-signal-orange',
    error: 'bg-red/10 text-red',
    info: 'bg-industrial-blue/10 text-industrial-blue',
    outline: 'border border-near-black/20 text-near-black',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
