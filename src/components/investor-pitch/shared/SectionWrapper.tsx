import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  parallax?: boolean;
}

export const SectionWrapper = ({ 
  id, 
  children, 
  className,
  parallax = false 
}: SectionWrapperProps) => {
  return (
    <section 
      id={id}
      className={cn(
        'py-16 md:py-24 relative',
        parallax && 'parallax-section',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
};
