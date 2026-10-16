import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  placement?: 'center' | 'right';
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  placement = 'center',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeRef.current();
      if (e.key === 'Tab' && dialogRef.current) {
        const controls = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]',
          ),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      dialogRef.current
        ?.querySelector<HTMLElement>('button, input, [tabindex="0"]')
        ?.focus();
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (isOpen && previous?.isConnected) previous.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex ${placement === 'right' ? 'items-stretch justify-end' : 'items-center justify-center p-4 sm:p-6'} overflow-y-auto animate-fadeIn`}
    >
      <div
        className="fixed inset-0 bg-[#241B24]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${widths[maxWidth]} bg-white ${placement === 'right' ? 'h-full overflow-y-auto' : 'rounded-[20px] my-8'} border border-[#E9DFE4] shadow-xl p-6 sm:p-8 z-10 transition-transform duration-200`}
        role="dialog"
        ref={dialogRef}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h3
                id={titleId}
                className="text-xl font-bold text-[#241B24] font-heading"
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#665D65] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#665D65] hover:text-[#241B24] hover:bg-[#FBE7ED] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
