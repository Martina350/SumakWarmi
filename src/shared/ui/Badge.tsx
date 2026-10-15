import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'neutral',
  className = '',
  icon,
}) => {
  const tones = {
    neutral: 'bg-[#F9F1F3] text-[#716A70] border-[#E9DEE3]',
    brand: 'bg-[#7A3F65]/10 text-[#7A3F65] border-[#7A3F65]/20',
    success: 'bg-[#287A56]/10 text-[#287A56] border-[#287A56]/20',
    warning: 'bg-[#9A6414]/10 text-[#9A6414] border-[#9A6414]/20',
    danger: 'bg-[#B43D4C]/10 text-[#B43D4C] border-[#B43D4C]/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${tones[tone]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
