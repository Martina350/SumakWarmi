import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#665D65]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && <div className="absolute left-3.5 text-[#665D65] pointer-events-none flex items-center">{leftIcon}</div>}
        <input
          id={inputId}
          className={`w-full h-11 bg-white border rounded-xl text-sm text-[#241B24] placeholder-[#665D65]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] disabled:bg-[#F4F0F2] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error ? 'border-[#B42336] focus:border-[#B42336] focus:ring-[#B42336]/20' : 'border-[#E9DFE4]'
          } ${className}`}
          {...props}
        />
        {rightIcon && <div className="absolute right-3.5 text-[#665D65] flex items-center">{rightIcon}</div>}
      </div>
      {error ? (
        <p className="text-xs text-[#B42336] font-medium flex items-center gap-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#665D65]">{helperText}</p>
      ) : null}
    </div>
  );
};
