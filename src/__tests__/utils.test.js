import { hasDuplicates, findAllDuplicates, removeDuplicates, groupBy, sortByMultiple } from '../utils/arrayHelpers';

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

  describe('findAllDuplicates', () => {
    test('should find all duplicates in array', () => {
      const array = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'A' },
        { id: 4, name: 'C' },
        { id: 5, name: 'B' }
      ];
      expect(findAllDuplicates(array, 'name')).toEqual(['A', 'B']);
    });

    test('should return empty array for no duplicates', () => {
      const array = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ];
      expect(findAllDuplicates(array, 'name')).toEqual([]);
    });
  });

  describe('removeDuplicates', () => {
    test('should remove duplicates from array', () => {
      const array = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'A' },
        { id: 4, name: 'C' }
      ];
      const result = removeDuplicates(array, 'name');
      expect(result).toHaveLength(3);
      expect(result.map(item => item.name)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('groupBy', () => {
    test('should group array by key', () => {
      const array = [
        { id: 1, type: 'A', value: 10 },
        { id: 2, type: 'B', value: 20 },
        { id: 3, type: 'A', value: 30 },
        { id: 4, type: 'C', value: 40 }
      ];
      const result = groupBy(array, 'type');
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
      expect(result.C).toHaveLength(1);
    });
  });

  describe('sortByMultiple', () => {
    test('should sort array by multiple keys', () => {
      const array = [
        { id: 1, type: 'B', value: 30 },
        { id: 2, type: 'A', value: 20 },
        { id: 3, type: 'A', value: 10 },
        { id: 4, type: 'B', value: 40 }
      ];
      const result = sortByMultiple(array, [
        { key: 'type', direction: 'asc' },
        { key: 'value', direction: 'asc' }
      ]);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
      expect(result[3].id).toBe(4);
    });
  });
}); 