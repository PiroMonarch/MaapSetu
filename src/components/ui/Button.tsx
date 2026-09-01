import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary:
        'bg-electric-lime text-near-black font-semibold hover:bg-[#d4f87a] shadow-sm hover:shadow-md hover:shadow-electric-lime/20 btn-glow active:scale-95',
      secondary:
        'bg-near-black text-warm-ivory font-semibold hover:bg-[#1e2124] shadow-sm hover:shadow-md hover:shadow-near-black/20 active:scale-95',
      outline:
        'border-2 border-near-black/20 text-near-black font-semibold hover:border-near-black hover:bg-near-black/5 active:scale-95',
      ghost:
        'text-near-black/70 font-semibold hover:text-near-black hover:bg-near-black/5 active:scale-95',
      danger:
        'bg-red text-white font-semibold hover:bg-[#c94747] shadow-sm hover:shadow-md hover:shadow-red/20 active:scale-95',
      subtle:
        'bg-near-black/5 text-near-black font-semibold hover:bg-near-black/10 active:scale-95',
    };

    const sizes = {
      sm: 'h-8 px-4 text-xs rounded-lg gap-1.5',
      md: 'h-10 px-5 text-sm rounded-lg gap-2',
      lg: 'h-12 px-7 text-base rounded-xl gap-2',
      icon: 'h-10 w-10 flex items-center justify-center p-0 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-lime focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer font-sans',
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
