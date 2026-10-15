import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || props.name;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-wider text-[#665D65]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full p-3.5 bg-white border rounded-xl text-sm text-[#241B24] placeholder-[#665D65]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D52C69]/20 focus:border-[#D52C69] disabled:bg-[#F4F0F2] ${
          error ? 'border-[#B42336] focus:border-[#B42336] focus:ring-[#B42336]/20' : 'border-[#E9DFE4]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#B42336] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#665D65]">{helperText}</p>
      ) : null}
    </div>
  );
};
