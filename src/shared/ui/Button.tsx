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
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3F65]';

  const sizes = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2 min-h-[44px]',
    lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
  };

  const variants = {
    primary: 'bg-[#7A3F65] hover:bg-[#653353] text-white shadow-sm active:translate-y-px',
    secondary: 'bg-[#F9F1F3] hover:bg-[#E9DEE3] text-[#7A3F65] active:translate-y-px',
    outline: 'border border-[#E9DEE3] hover:border-[#7A3F65] hover:bg-[#F9F1F3]/50 text-[#272329]',
    ghost: 'hover:bg-[#F9F1F3] text-[#272329]',
    danger: 'bg-[#B43D4C] hover:bg-[#972b38] text-white shadow-sm',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
};
