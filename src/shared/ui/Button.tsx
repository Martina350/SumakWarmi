import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D52C69] active:translate-y-px';

  const sizes = {
    sm: 'h-9 px-3.5 text-xs gap-1.5 min-h-[36px]',
    md: 'h-11 px-5 text-sm gap-2 min-h-[44px]',
    lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
  };

  const variants = {
    primary:
      'bg-[#A91E50] hover:bg-[#8F1742] text-white shadow-xs hover:shadow-sm active:bg-[#7D1238]',
    secondary:
      'bg-[#FBE7ED] hover:bg-[#F6D5DF] text-[#A91E50] font-semibold active:bg-[#EFC4D1]',
    outline:
      'bg-white border border-[#E9DFE4] hover:border-[#D52C69] hover:bg-[#FBE7ED]/60 text-[#A91E50] font-medium shadow-2xs',
    ghost:
      'bg-transparent hover:bg-[#FBE7ED] text-[#241B24] hover:text-[#A91E50]',
    danger:
      'bg-[#B42336] hover:bg-[#981B2C] text-white shadow-xs',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0 flex items-center justify-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
