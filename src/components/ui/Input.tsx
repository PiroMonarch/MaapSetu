import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-none border-b-2 border-near-black/20 bg-transparent px-0 py-2 text-base text-near-black transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-near-black/40 focus-visible:outline-none focus-visible:border-electric-lime disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red focus-visible:border-red',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
