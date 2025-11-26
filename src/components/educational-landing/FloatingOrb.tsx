import { motion } from 'motion/react';

interface FloatingOrbProps {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
  disableAnimation?: boolean;
}

export const FloatingOrb = ({ 
  size = 300, 
  color = 'hsl(var(--primary))', 
  delay = 0,
  duration = 20,
  className = '',
  disableAnimation = false
}: FloatingOrbProps) => {
  return (
    <motion.div
      className={`rounded-full blur-3xl opacity-20 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
      }}
      {...(disableAnimation ? {} : {
        animate: {
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        },
        transition: {
          duration,
          delay,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }
      })}
    />
  );
};
