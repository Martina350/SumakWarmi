import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'outline';
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  isInteractive = false,
  className = '',
  ...props
}) => {
  const variants = {
    surface: 'bg-white border border-[#E9DEE3] shadow-xs',
    subtle: 'bg-[#F9F1F3] border border-[#E9DEE3]/70',
    outline: 'bg-transparent border border-[#E9DEE3]',
  };

  const interactive = isInteractive
    ? 'transition-all duration-200 hover:border-[#7A3F65]/50 hover:shadow-md cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl p-6 ${variants[variant]} ${interactive} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
