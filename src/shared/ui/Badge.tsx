import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
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
    neutral: 'bg-[#F4F0F2] text-[#665D65] border-[#E9DFE4]',
    brand: 'bg-[#FBE7ED] text-[#A91E50] border-[#EE839F]/30',
    success: 'bg-[#E8F3EE] text-[#267A59] border-[#267A59]/20',
    warning: 'bg-[#FFF1D9] text-[#9A6200] border-[#9A6200]/20',
    danger: 'bg-[#FDEBED] text-[#B42336] border-[#B42336]/20',
    info: 'bg-[#EAF3FF] text-[#2563A6] border-[#2563A6]/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[tone]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
