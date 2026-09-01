import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-near-black/40 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-near-black/15 bg-white/70 px-3 py-2 text-sm text-near-black transition-all placeholder:text-near-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime focus-visible:ring-offset-0 focus-visible:border-transparent hover:border-near-black/25 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-red focus-visible:ring-red',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-near-black/40 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-near-black/15 bg-white/70 px-3 py-2 text-sm text-near-black transition-all placeholder:text-near-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime focus-visible:ring-offset-0 focus-visible:border-transparent hover:border-near-black/25 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red focus-visible:ring-red',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
