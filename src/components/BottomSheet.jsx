import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './BottomSheet.css';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = '',
  maxHeight = '85vh',
}) {
  const triggerRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (sheetRef.current) {
          const focusable = sheetRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          }
        }
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && sheetRef.current) {
          const focusables = sheetRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="sheet-portal">
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            className={`sheet-dialog ${className}`}
            style={{ maxHeight }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sheet-handle-bar" onClick={onClose}>
              <div className="sheet-handle-pill" />
            </div>

            {(title || subtitle) && (
              <div className="sheet-header">
                <div>
                  {title && (
                    <h3 id="sheet-title" className="sheet-title">
                      {title}
                    </h3>
                  )}
                  {subtitle && <p className="sheet-subtitle">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  className="sheet-close-btn"
                  onClick={onClose}
                  aria-label="Close sheet"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            )}

            <div className="sheet-content">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
