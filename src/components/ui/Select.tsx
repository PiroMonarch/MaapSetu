import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-12 w-full appearance-none rounded-none border-b-2 border-near-black/20 bg-transparent px-0 py-2 pr-8 text-base text-near-black transition-colors focus-visible:outline-none focus-visible:border-electric-lime disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-3 h-5 w-5 text-near-black/50" />
      </div>
    );
  }
);
Select.displayName = 'Select';
