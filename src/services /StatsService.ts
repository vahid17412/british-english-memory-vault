import { IStatisticsRepository } from '@/repositories/contracts/IStatisticsRepository';
import { IStatsLockManager } from '@/shared/interfaces/IStatsLockManager';
import { MetricsCalculator } from '@/domain/statistics/MetricsCalculator';
import { ReviewPerformance } from '@/domain/srs/SRSTypes';
import { DailySessionStats } from '@/domain/models/Statistics';

export class StatsService {
  constructor(
    private readonly statsRepo: IStatisticsRepository,
    private readonly lockManager: IStatsLockManager
  ) {}

  async processReview(dateId: string, performance: ReviewPerformance, attempt = 1): Promise<void> {
    const maxRetries = 3;
    const releaseLock = await this.lockManager.acquire(dateId);

    try {
      const currentStats = await this.statsRepo.getDailyStats(dateId);
      
      const newStats: DailySessionStats = currentStats 
        ? MetricsCalculator.calculateFromExisting(currentStats, performance)
        : MetricsCalculator.calculateFromEmpty(dateId, performance);

      await this.statsRepo.saveDailyStats(newStats);
      
      // Observability Hook
      this.onStatsUpdated(newStats);

    } catch (error) {
      if (attempt <= maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        releaseLock();
        return this.processReview(dateId, performance, attempt + 1);
      }
      
      // Dead-letter logging
      console.error(`[StatsService] CRITICAL: Failed to update stats for ${dateId} after ${maxRetries} attempts.`, error);
      throw error;
    } finally {
      releaseLock();
    }
  }

  private onStatsUpdated(stats: DailySessionStats): void {
    // Future integration for Analytics or ML modules
  }
}
