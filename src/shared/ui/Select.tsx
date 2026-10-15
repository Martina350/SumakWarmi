import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-[#716A70]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full h-12 bg-white border rounded-xl text-sm text-[#272329] pl-4 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A3F65]/20 focus:border-[#7A3F65] cursor-pointer disabled:bg-[#F9F1F3] disabled:cursor-not-allowed ${
            error ? 'border-[#B43D4C]' : 'border-[#E9DEE3]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716A70] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#B43D4C] font-medium">{error}</p>}
    </div>
  );
};
