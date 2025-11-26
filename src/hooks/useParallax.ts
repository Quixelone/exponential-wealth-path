import { useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'motion/react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: boolean;
  rotate?: boolean;
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.5, direction = 'down', scale = false, rotate = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = 300 * speed;

  let y: MotionValue<number> | undefined;
  let x: MotionValue<number> | undefined;
  let scaleValue: MotionValue<number> | undefined;
  let rotateValue: MotionValue<number> | undefined;

  switch (direction) {
    case 'up':
      y = useTransform(scrollYProgress, [0, 1], [range, -range]);
      break;
    case 'down':
      y = useTransform(scrollYProgress, [0, 1], [-range, range]);
      break;
    case 'left':
      x = useTransform(scrollYProgress, [0, 1], [range, -range]);
      break;
    case 'right':
      x = useTransform(scrollYProgress, [0, 1], [-range, range]);
      break;
  }

  if (scale) {
    scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 0.9]);
  }

  if (rotate) {
    rotateValue = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  }

  return { ref, y, x, scale: scaleValue, rotate: rotateValue };
};
