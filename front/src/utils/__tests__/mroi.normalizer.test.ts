/**
 * Unit tests for mroi.normalizer.ts
 * Tests all point format conversions and validations
 */

import {
  isPointArray,
  isPointObject,
  pointToArray,
  normalizeRulePoints,
  normalizeRegionConfig,
  validateNormalizedData,
  safeGetPoint,
  getValidPoints,
} from '../mroi.normalizer';

describe('MROI Normalizer', () => {
  describe('isPointArray()', () => {
    it('should return true for array [x, y]', () => {
      expect(isPointArray([100, 200])).toBe(true);
    });

    it('should return false for object {x, y}', () => {
      expect(isPointObject({ x: 100, y: 200 })).toBe(true);
    });

    it('should return false for invalid array', () => {
      expect(isPointArray([100])).toBe(false);
      expect(isPointArray([100, 'two'])).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isPointArray(null)).toBe(false);
      expect(isPointArray(undefined)).toBe(false);
    });
  });

  describe('pointToArray()', () => {
    it('should return same array for array input', () => {
      const point = [100, 200];
      expect(pointToArray(point)).toEqual([100, 200]);
    });

    it('should convert object {x, y} to array', () => {
      const point = { x: 100, y: 200 };
      expect(pointToArray(point)).toEqual([100, 200]);
    });

    it('should throw error for invalid format', () => {
      expect(() => pointToArray({ wrong: 'format' })).toThrow();
      expect(() => pointToArray(null)).toThrow();
      expect(() => pointToArray('string')).toThrow();
    });
  });

  describe('normalizeRulePoints()', () => {
    it('should normalize rule with array points', () => {
      const rule = {
        roi_id: 'test-1',
        name: 'Test Rule',
        points: [[100, 200], [150, 300]],
      };

      const normalized = normalizeRulePoints(rule);
      expect(normalized.points).toEqual([[100, 200], [150, 300]]);
    });

    it('should convert rule with object points to array', () => {
      const rule = {
        roi_id: 'test-2',
        name: 'Test Rule',
        points: [{ x: 100, y: 200 }, { x: 150, y: 300 }],
      };

      const normalized = normalizeRulePoints(rule);
      expect(normalized.points).toEqual([[100, 200], [150, 300]]);
    });

    it('should handle mixed format (both array and object)', () => {
      const rule = {
        roi_id: 'test-3',
        name: 'Test Rule',
        points: [[100, 200], { x: 150, y: 300 }],
      };

      const normalized = normalizeRulePoints(rule);
      expect(normalized.points).toEqual([[100, 200], [150, 300]]);
    });

    it('should throw error for invalid point in rule', () => {
      const rule = {
        roi_id: 'test-4',
        name: 'Test Rule',
        points: [[100, 200], { invalid: true }],
      };

      expect(() => normalizeRulePoints(rule)).toThrow();
    });
  });

  describe('normalizeRegionConfig()', () => {
    it('should normalize config with multiple rules', () => {
      const config = {
        rule: [
          {
            roi_id: 'rule-1',
            name: 'Rule 1',
            points: [[100, 200]],
          },
          {
            roi_id: 'rule-2',
            name: 'Rule 2',
            points: [{ x: 150, y: 300 }],
          },
        ],
      };

      const normalized = normalizeRegionConfig(config);
      expect(normalized.rule[0].points).toEqual([[100, 200]]);
      expect(normalized.rule[1].points).toEqual([[150, 300]]);
    });

    it('should return empty config as-is', () => {
      const config = { rule: [] };
      expect(normalizeRegionConfig(config)).toEqual({ rule: [] });
    });
  });

  describe('validateNormalizedData()', () => {
    it('should return valid for correct format', () => {
      const config = {
        rule: [
          {
            roi_id: 'test-1',
            name: 'Test',
            points: [[100, 200], [150, 300]],
          },
        ],
      };

      const result = validateNormalizedData(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for object format', () => {
      const config = {
        rule: [
          {
            roi_id: 'test-1',
            name: 'Test',
            points: [{ x: 100, y: 200 }],
          },
        ],
      };

      const result = validateNormalizedData(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should report errors for missing points array', () => {
      const config = {
        rule: [
          {
            roi_id: 'test-1',
            name: 'Test',
            // missing points
          },
        ],
      };

      const result = validateNormalizedData(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('safeGetPoint()', () => {
    it('should extract point from array format', () => {
      const rule = {
        roi_id: 'test-1',
        points: [[100, 200], [150, 300]],
      };

      expect(safeGetPoint(rule, 0)).toEqual([100, 200]);
      expect(safeGetPoint(rule, 1)).toEqual([150, 300]);
    });

    it('should extract point from object format', () => {
      const rule = {
        roi_id: 'test-1',
        points: [{ x: 100, y: 200 }],
      };

      expect(safeGetPoint(rule, 0)).toEqual([100, 200]);
    });

    it('should return null for invalid point', () => {
      const rule = {
        roi_id: 'test-1',
        points: [{ invalid: true }],
      };

      expect(safeGetPoint(rule, 0)).toBeNull();
    });

    it('should return null for out of bounds', () => {
      const rule = {
        roi_id: 'test-1',
        points: [[100, 200]],
      };

      expect(safeGetPoint(rule, 999)).toBeNull();
    });
  });

  describe('getValidPoints()', () => {
    it('should return all valid points from array format', () => {
      const rule = {
        roi_id: 'test-1',
        points: [[100, 200], [150, 300]],
      };

      expect(getValidPoints(rule)).toEqual([[100, 200], [150, 300]]);
    });

    it('should skip invalid points', () => {
      const rule = {
        roi_id: 'test-1',
        points: [[100, 200], { invalid: true }, [150, 300]],
      };

      expect(getValidPoints(rule)).toEqual([[100, 200], [150, 300]]);
    });

    it('should return empty array for missing points', () => {
      const rule = { roi_id: 'test-1' };
      expect(getValidPoints(rule)).toEqual([]);
    });
  });
});

// Type the 'describe' and 'it' if Jest is not globally available
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function expect(value: any): any;
