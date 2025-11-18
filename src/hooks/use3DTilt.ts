import { useEffect, useRef, useState } from 'react';

interface TiltOptions {
  max?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  easing?: string;
}

export const use3DTilt = (options: TiltOptions = {}) => {
  const {
    max = 15,
    perspective = 1000,
    scale = 1.02,
    speed = 300,
    easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * max;
      const rotateY = ((centerX - x) / centerX) * max;
      
      element.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
      element.style.transition = `transform ${speed}ms ${easing}`;
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      element.style.transition = `transform ${speed}ms ${easing}`;
      element.style.transform = `
        perspective(${perspective}px)
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
      `;
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [max, perspective, scale, speed, easing]);

  return { ref, isHovering };
};
