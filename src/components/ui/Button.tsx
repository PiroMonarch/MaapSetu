import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-electric-lime text-near-black hover:bg-[#b5e058] font-bold uppercase tracking-wider',
      secondary: 'bg-near-black text-warm-ivory hover:bg-near-black/90 font-bold',
      outline: 'border-2 border-near-black text-near-black hover:bg-near-black hover:text-warm-ivory font-bold uppercase tracking-wider',
      ghost: 'text-near-black hover:bg-black/5 font-semibold',
      danger: 'bg-red text-white hover:bg-red/90 font-bold',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs',
      md: 'h-12 px-6 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
      icon: 'h-12 w-12 flex items-center justify-center p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-none transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-near-black disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
