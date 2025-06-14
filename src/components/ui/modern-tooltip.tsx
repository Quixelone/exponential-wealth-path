
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModernTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const ModernTooltip: React.FC<ModernTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + scrollX + rect.width / 2;
            y = rect.top + scrollY - 10;
            break;
          case 'bottom':
            x = rect.left + scrollX + rect.width / 2;
            y = rect.bottom + scrollY + 10;
            break;
          case 'left':
            x = rect.left + scrollX - 10;
            y = rect.top + scrollY + rect.height / 2;
            break;
          case 'right':
            x = rect.right + scrollX + 10;
            y = rect.top + scrollY + rect.height / 2;
            break;
        }
        
        setTooltipPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: tooltipPosition.x,
      top: tooltipPosition.y,
      transform: getTransform(),
      zIndex: 9999,
      pointerEvents: 'none',
    };
    
    return baseStyle;
  };

  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0%)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0%, -50%)';
      default:
        return 'translate(-50%, -100%)';
    }
  };

  const tooltipElement = isVisible && (
    <div style={getTooltipStyle()} className={`tooltip-content ${className}`}>
      {content}
      <div 
        className={`tooltip-arrow ${getArrowPosition()}`}
        style={getArrowStyle()}
      />
    </div>
  );

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 translate-x-1/2';
      default:
        return 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getArrowStyle = () => {
    return {};
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
  );
};

export default ModernTooltip;
