/**
 * 📐 MROI Normalizer Utility
 * Converts and validates ROI point formats
 * Handles both array [x,y] and object {x,y} formats safely
 *
 * PROBLEM: Database may return points in inconsistent formats:
 *   - ✅ Array format: [[100, 200], [150, 300]]
 *   - ❌ Object format: [{x: 100, y: 200}, {x: 150, y: 300}]
 *
 * SOLUTION: This utility normalizes to consistent array format
 */

export type PointArray = [number, number];

export interface PointObject {
  x: number;
  y: number;
}

export type Point = PointArray | PointObject;

/**
 * Check if a point is in array format [x, y]
 */
export function isPointArray(point: any): point is PointArray {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number'
  );
}

/**
 * Check if a point is in object format {x, y}
 */
export function isPointObject(point: any): point is PointObject {
  return (
    point &&
    typeof point === 'object' &&
    !Array.isArray(point) &&
    typeof point.x === 'number' &&
    typeof point.y === 'number'
  );
}

/**
 * Convert point to array format [x, y]
 * Safe: handles both formats and throws descriptive errors
 *
 * @param point - Point in either format
 * @returns PointArray [x, y]
 * @throws Error if point format is invalid
 */
export function pointToArray(point: any): PointArray {
  if (isPointArray(point)) {
    return point;
  }

  if (isPointObject(point)) {
    return [point.x, point.y];
  }

  throw new Error(
    `Invalid point format. Expected [x,y] or {x,y}, got: ${JSON.stringify(point)}`
  );
}

/**
 * Normalize all points in a single rule
 * Converts object-format points to array format
 *
 * @param rule - Rule with possibly inconsistent point format
 * @returns Rule with normalized points in array format
 * @throws Error if normalization fails
 */
export function normalizeRulePoints(rule: any): any {
  if (!rule) {
    return rule;
  }

  if (!Array.isArray(rule.points)) {
    // Missing points array, return as-is
    return rule;
  }

  try {
    const normalizedPoints = rule.points.map((point: any, idx: number) => {
      try {
        return pointToArray(point);
      } catch (error) {
        throw new Error(
          `Point ${idx} invalid: ${(error as Error).message}`
        );
      }
    });

    return {
      ...rule,
      points: normalizedPoints,
    };
  } catch (error) {
    throw new Error(
      `Failed to normalize rule "${rule.name}": ${(error as Error).message}`
    );
  }
}

/**
 * Normalize all rules in a region config
 * Converts entire config to consistent array format
 *
 * @param config - RegionAIConfig with possibly inconsistent formats
 * @returns RegionAIConfig with all points normalized
 * @throws Error if any rule cannot be normalized
 */
export function normalizeRegionConfig(config: any): any {
  if (!config || !Array.isArray(config.rule)) {
    return config;
  }

  const normalizedRules = config.rule.map((rule: any, idx: number) => {
    try {
      return normalizeRulePoints(rule);
    } catch (error) {
      throw new Error(
        `Rule ${idx} normalization failed: ${(error as Error).message}`
      );
    }
  });

  return {
    ...config,
    rule: normalizedRules,
  };
}

/**
 * Validate that data is properly normalized
 * All points should be in array format [x, y]
 *
 * @param config - RegionAIConfig to validate
 * @returns Validation result with detailed errors
 */
export function validateNormalizedData(
  config: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config) {
    errors.push('Config is null or undefined');
    return { valid: false, errors };
  }

  if (!Array.isArray(config.rule)) {
    errors.push('Config.rule must be an array');
    return { valid: false, errors };
  }

  config.rule.forEach((rule: any, ruleIdx: number) => {
    if (!rule) {
      errors.push(`Rule ${ruleIdx} is null or undefined`);
      return;
    }

    if (!Array.isArray(rule.points)) {
      errors.push(`Rule ${ruleIdx} (${rule.name}) has no points array`);
      return;
    }

    rule.points.forEach((point: any, pointIdx: number) => {
      if (!isPointArray(point)) {
        errors.push(
          `Rule ${ruleIdx} (${rule.name}), Point ${pointIdx} is not in [x,y] format. Got: ${JSON.stringify(point)}`
        );
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Safe point extraction with error handling
 * Use in drawing functions to handle any point format
 *
 * @param rule - Rule object
 * @param index - Point index
 * @returns [x, y] or null if extraction fails
 */
export function safeGetPoint(
  rule: any,
  index: number
): PointArray | null {
  try {
    if (!rule?.points || !Array.isArray(rule.points)) {
      return null;
    }

    const point = rule.points[index];
    return pointToArray(point);
  } catch (error) {
    console.error(
      `Failed to extract point ${index} from rule: ${(error as Error).message}`
    );
    return null;
  }
}

/**
 * Utility: Get all valid points from a rule
 * Skips any invalid points, returns array of valid ones
 *
 * @param rule - Rule object
 * @returns Array of valid [x, y] points
 */
export function getValidPoints(rule: any): PointArray[] {
  if (!rule?.points || !Array.isArray(rule.points)) {
    return [];
  }

  const validPoints: PointArray[] = [];

  rule.points.forEach((point: any) => {
    try {
      validPoints.push(pointToArray(point));
    } catch {
      // Skip invalid points
      console.warn(`Skipping invalid point: ${JSON.stringify(point)}`);
    }
  });

  return validPoints;
}

export default {
  isPointArray,
  isPointObject,
  pointToArray,
  normalizeRulePoints,
  normalizeRegionConfig,
  validateNormalizedData,
  safeGetPoint,
  getValidPoints,
};
