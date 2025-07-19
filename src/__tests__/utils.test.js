import { hasDuplicates } from '../utils';

describe('Utility Functions', () => {
  describe('hasDuplicates', () => {
    test('should return empty string for array without duplicates', () => {
      const array = [
        { alias: 'A' },
        { alias: 'B' },
        { alias: 'C' }
      ];
      expect(hasDuplicates(array)).toBe('');
    });

    test('should return duplicate alias for array with duplicates', () => {
      const array = [
        { alias: 'A' },
        { alias: 'B' },
        { alias: 'A' },
        { alias: 'C' }
      ];
      expect(hasDuplicates(array)).toBe('A');
    });

    test('should return first duplicate found', () => {
      const array = [
        { alias: 'A' },
        { alias: 'B' },
        { alias: 'B' },
        { alias: 'A' }
      ];
      expect(hasDuplicates(array)).toBe('A');
    });

    test('should handle empty array', () => {
      const array = [];
      expect(hasDuplicates(array)).toBe('');
    });

    test('should handle single element array', () => {
      const array = [{ alias: 'A' }];
      expect(hasDuplicates(array)).toBe('');
    });
  });
}); 