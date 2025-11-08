import { Variants } from 'framer-motion';

/**
 * Reusable animation configurations for consistent motion design
 */

// Spring physics for natural movement
export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const softSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
};

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Stagger children for list animations
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Interactive hover effects
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springConfig,
};

export const hoverLift = {
  whileHover: { y: -4, transition: softSpring },
  whileTap: { y: 0 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.4)",
    transition: { duration: 0.3 }
  },
};

// Slide animations for drawers/modals
export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const slideInBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};
