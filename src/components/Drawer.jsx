import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import BottomSheet from './BottomSheet';
import './Drawer.css';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = '480px',
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 820;
    }
    return false;
  });

  const triggerRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && !isMobile) {
      triggerRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll(
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
        if (e.key === 'Tab' && drawerRef.current) {
          const focusables = drawerRef.current.querySelectorAll(
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
  }, [isOpen, isMobile, onClose]);

  // If on mobile, delegate directly to BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        className={className}
      >
        {children}
      </BottomSheet>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="drawer-portal">
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={drawerRef}
            className={`drawer-panel ${className}`}
            style={{ width }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {(title || subtitle) && (
              <div className="drawer-header">
                <div>
                  {title && (
                    <h3 id="drawer-title" className="drawer-title">
                      {title}
                    </h3>
                  )}
                  {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={onClose}
                  aria-label="Close drawer"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            )}

            <div className="drawer-body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
