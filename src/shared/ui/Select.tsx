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
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-[#665D65]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full h-11 bg-white border rounded-xl text-sm text-[#241B24] pl-4 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] cursor-pointer disabled:bg-[#F4F0F2] disabled:cursor-not-allowed ${
            error ? 'border-[#B42336]' : 'border-[#E9DFE4]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#665D65] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#B42336] font-medium">{error}</p>}
    </div>
  );
};
