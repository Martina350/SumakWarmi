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
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      dialogRef.current
        ?.querySelector<HTMLElement>('button, input, [tabindex="0"]')
        ?.focus();

      return () => {
        document.body.style.overflow = prev === 'hidden' ? '' : (prev || '');
        window.removeEventListener('keydown', handleKeyDown);
        if (previous?.isConnected) previous.focus();
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const isDrawer = placement === 'right';

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isDrawer
          ? 'items-stretch justify-end'
          : 'items-center justify-center p-3 sm:p-5 md:p-6'
      } overflow-hidden animate-fadeIn`}
    >
      <div
        className="fixed inset-0 bg-[#241B24]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${widths[maxWidth]} bg-white ${
          isDrawer
            ? 'h-full max-h-screen border-l rounded-none'
            : 'max-h-[min(90vh,calc(100dvh-2rem))] sm:max-h-[min(88vh,calc(100dvh-3rem))] rounded-[24px] border my-auto'
        } border-[#E9DFE4] shadow-2xl z-10 flex flex-col overflow-hidden transition-transform duration-200`}
        role="dialog"
        ref={dialogRef}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
      >
        {/* Sticky Pinned Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-[#E9DFE4] shrink-0 bg-white sticky top-0 z-10">
          <div className="min-w-0 pr-2">
            {title && (
              <h3
                id={titleId}
                className="text-lg sm:text-xl font-bold text-[#241B24] font-heading leading-snug"
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#665D65] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 -mt-1 rounded-xl text-[#665D65] hover:text-[#241B24] hover:bg-[#FBE7ED] transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
