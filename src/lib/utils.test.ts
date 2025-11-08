import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (classNames utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', {
        'conditional-class': true,
        'not-included': false,
      });
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).not.toContain('not-included');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'another-class');
      expect(result).toContain('base-class');
      expect(result).toContain('another-class');
    });

    it('should merge Tailwind classes properly', () => {
      // tailwind-merge should prioritize the last class when there's a conflict
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });
  });
});
