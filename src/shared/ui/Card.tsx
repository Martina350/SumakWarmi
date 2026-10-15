import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'outline' | 'muted';
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
    surface: 'bg-white border border-[#E9DFE4] shadow-xs',
    subtle: 'bg-[#FFF7F9] border border-[#E9DFE4]/80',
    muted: 'bg-[#F4F0F2] border border-[#E9DFE4]',
    outline: 'bg-transparent border border-[#E9DFE4]',
  };

  const interactive = isInteractive
    ? 'transition-all duration-200 hover:border-[#EE839F] hover:shadow-md cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-[20px] p-6 ${variants[variant]} ${interactive} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
