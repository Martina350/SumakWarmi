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
        <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-wider text-[#716A70]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full p-3.5 bg-white border rounded-xl text-sm text-[#272329] placeholder-[#716A70]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A3F65]/20 focus:border-[#7A3F65] disabled:bg-[#F9F1F3] ${
          error ? 'border-[#B43D4C]' : 'border-[#E9DEE3]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#B43D4C] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#716A70]">{helperText}</p>
      ) : null}
    </div>
  );
};
