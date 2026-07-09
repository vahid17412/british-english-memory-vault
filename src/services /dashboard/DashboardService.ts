import { QueueBuilder } from '@/services/QueueBuilder';
import { IStatisticsRepository } from '@/repositories/contracts/IStatisticsRepository';
import { IClock } from '@/shared/interfaces/IClock';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

export interface DashboardMetricsDTO {
  readonly queueLength: number;
  readonly reviewsCompletedToday: number;
  readonly todayAccuracyPercent: number;
  readonly studyTimeRawSeconds: number;
}

export class DashboardService {
  constructor(
    private readonly queueBuilder: QueueBuilder,
    private readonly statsRepo: IStatisticsRepository,
    private readonly clock: IClock
  ) {}

  async getTodayMetrics(signal?: AbortSignal): Promise<DashboardMetricsDTO> {
    if (signal?.aborted) throw new Error('Query aborted');

    const todayId = this.clock.dateId(this.clock.now());

    // Concurrency Optimization via Promise.all
    const [queueLength, stats] = await Promise.all([
      this.queueBuilder.getDailyQueueCount({
        newCardsCap: APP_CONFIG.QUEUE.NEW_CARDS_CAP,
        reviewCardsCap: APP_CONFIG.QUEUE.REVIEW_CARDS_CAP,
      }),
      this.statsRepo.getDailyStats(todayId)
    ]);

    if (signal?.aborted) throw new Error('Query aborted post-fetch');

    let accuracy = 0;
    let rawSeconds = 0;

    if (stats && stats.totalReviews > 0) {
      accuracy = (stats.correctReviews / stats.totalReviews) * 100;
      rawSeconds = Math.round(stats.totalTimeMs / 1000);
    }

    return Object.freeze({
      queueLength,
      reviewsCompletedToday: stats?.totalReviews || 0,
      todayAccuracyPercent: parseFloat(accuracy.toFixed(1)),
      studyTimeRawSeconds: rawSeconds,
    });
  }
}
