import { motion } from 'motion/react';

interface FloatingOrbProps {
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FloatingOrb = ({ 
  size = 300, 
  color = 'hsl(var(--primary))', 
  delay = 0,
  duration = 20,
  className = ''
}: FloatingOrbProps) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
      }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};
