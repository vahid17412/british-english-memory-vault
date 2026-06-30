import { DailySessionStats } from '@/domain/models/Statistics';
import { ReviewPerformance } from '@/domain/srs/SRSTypes';

export class MetricsCalculator {
  private static validatePerformance(performance: ReviewPerformance): void {
    if (performance.reviewTimeMs < 0) throw new Error('[Metrics] Invalid reviewTimeMs: must be >= 0');
    if (performance.hintUsageLevel < 0 || performance.hintUsageLevel > 3) {
      throw new Error('[Metrics] Invalid hintUsageLevel: must be between 0 and 3');
    }
  }

  private static freeze<T>(obj: T): T {
    return Object.freeze(obj);
  }

  static calculateFromEmpty(dateId: string, performance: ReviewPerformance): DailySessionStats {
    this.validatePerformance(performance);
    return this.freeze({
      id: dateId,
      totalReviews: 1,
      correctReviews: performance.isCorrect ? 1 : 0,
      incorrectReviews: !performance.isCorrect ? 1 : 0,
      totalTimeMs: performance.reviewTimeMs,
    });
  }

  static calculateFromExisting(currentStats: DailySessionStats, performance: ReviewPerformance): DailySessionStats {
    this.validatePerformance(performance);
    return this.freeze({
      id: currentStats.id,
      totalReviews: currentStats.totalReviews + 1,
      correctReviews: currentStats.correctReviews + (performance.isCorrect ? 1 : 0),
      incorrectReviews: currentStats.incorrectReviews + (!performance.isCorrect ? 1 : 0),
      totalTimeMs: currentStats.totalTimeMs + performance.reviewTimeMs,
    });
  }
}
