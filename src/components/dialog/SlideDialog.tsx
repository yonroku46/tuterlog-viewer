import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './SlideDialog.scss';

interface SlideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

const SlideDialog: React.FC<SlideDialogProps> = ({ isOpen, onClose, title, children, footer, noPadding }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      setShouldRender(true);
      window.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => {
        setActive(true);
      }, 10);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setActive(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`slide-dialog-overlay ${active ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`slide-dialog-content ${active ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dialog-header">
          <button className="back-btn" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="dialog-title">{title}</h2>
          <div className="header-placeholder" />
        </header>
        <div className={`dialog-body ${noPadding ? 'no-padding' : ''}`}>
          {children}
        </div>
        {footer && (
          <footer className="dialog-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default SlideDialog;
