import React from 'react';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-xs font-semibold text-near-black/60 uppercase tracking-wider mb-1.5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export function FormGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-0', className)}>{children}</div>;
}

export function FormError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('mt-1.5 text-xs font-medium text-red', className)}>{children}</p>
  );
}
