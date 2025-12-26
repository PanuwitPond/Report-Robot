/**
 * 📊 MROI Logger Utility
 * Provides standardized logging for data format issues
 * Helps identify data inconsistencies
 */

export class MroiLogger {
  /**
   * Log point format information
   * Helps identify if points are in array or object format
   */
  static logPointsFormat(ruleName: string, points: any) {
    if (!Array.isArray(points)) {
      console.warn(`⚠️ [${ruleName}] points is not array:`, typeof points);
      return;
    }

    if (points.length === 0) {
      console.log(`📊 [${ruleName}] Points: empty array`);
      return;
    }

    const firstPoint = points[0];
    const isArray = Array.isArray(firstPoint);
    const isObject = firstPoint && typeof firstPoint === 'object' && !isArray;

    console.log(`📊 [${ruleName}] Points Format:`, {
      totalPoints: points.length,
      firstPoint: firstPoint,
      isArray,
      isObject,
      format: isArray ? '✅ PointArray' : isObject ? '⚠️ Point Object' : '❌ Unknown',
    });
  }

  /**
   * Identify data format inconsistencies in rules
   * Returns array of issues found
   */
  static logDataInconsistency(rules: any[]) {
    const inconsistencies: any[] = [];

    rules.forEach((rule, idx) => {
      if (!rule.points || !Array.isArray(rule.points)) {
        inconsistencies.push({
          ruleIndex: idx,
          ruleName: rule.name || 'Unnamed',
          issue: 'points is not array',
          actual: typeof rule.points,
        });
        return;
      }

      if (rule.points.length === 0) {
        return; // Empty points is ok
      }

      const firstPoint = rule.points[0];
      const isArray = Array.isArray(firstPoint);
      const isObject = firstPoint && typeof firstPoint === 'object' && !isArray;

      if (isObject) {
        inconsistencies.push({
          ruleIndex: idx,
          ruleName: rule.name || 'Unnamed',
          issue: 'Object format detected (should be array)',
          firstPoint,
          format: 'Object',
        });
      }
    });

    if (inconsistencies.length > 0) {
      console.warn('⚠️ Data Format Inconsistencies Found:');
      console.table(inconsistencies);
    } else {
      console.log('✅ All rules have consistent point format (array)');
    }

    return inconsistencies;
  }

  /**
   * Log drawing error with context
   */
  static logDrawingError(ruleId: string, ruleName: string, error: Error, context?: any) {
    console.error(`❌ Drawing error in rule "${ruleName}" (${ruleId}):`, {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Log normalization operation
   */
  static logNormalizationStart(ruleCount: number) {
    console.log(`🔄 Starting data normalization for ${ruleCount} rules...`);
  }

  /**
   * Log normalization completion
   */
  static logNormalizationComplete(ruleCount: number, issuesFound: number) {
    console.log(`✅ Data normalization complete:`, {
      rulesProcessed: ruleCount,
      issuesFound,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log normalization error
   */
  static logNormalizationError(ruleIndex: number, ruleName: string, error: Error) {
    console.error(`❌ Normalization error in rule ${ruleIndex} "${ruleName}":`, {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export default MroiLogger;
