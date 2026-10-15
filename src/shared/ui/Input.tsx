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
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#716A70]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && <div className="absolute left-3.5 text-[#716A70] pointer-events-none flex items-center">{leftIcon}</div>}
        <input
          id={inputId}
          className={`w-full h-12 bg-white border rounded-xl text-sm text-[#272329] placeholder-[#716A70]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A3F65]/20 focus:border-[#7A3F65] disabled:bg-[#F9F1F3] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-4'
          } ${rightIcon ? 'pr-10' : 'pr-4'} ${
            error ? 'border-[#B43D4C] focus:border-[#B43D4C] focus:ring-[#B43D4C]/20' : 'border-[#E9DEE3]'
          } ${className}`}
          {...props}
        />
        {rightIcon && <div className="absolute right-3.5 text-[#716A70] flex items-center">{rightIcon}</div>}
      </div>
      {error ? (
        <p className="text-xs text-[#B43D4C] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#716A70]">{helperText}</p>
      ) : null}
    </div>
  );
};
