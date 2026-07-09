import { QueueBuilder } from '@/services/QueueBuilder';
import { IStatisticsRepository } from '@/repositories/contracts/IStatisticsRepository';
import { SettingsService } from '@/services/settings/SettingsService';
import { IClock } from '@/shared/interfaces/IClock';

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
    private readonly settingsService: SettingsService,
    private readonly clock: IClock
  ) {}

  async getTodayMetrics(signal?: AbortSignal): Promise<DashboardMetricsDTO> {
    if (signal?.aborted) throw new Error('Query aborted');
    const todayId = this.clock.dateId(this.clock.now());

    const settings = await this.settingsService.getSettings();

    const [queueLength, stats] = await Promise.all([
      this.queueBuilder.getDailyQueueCount({
        newCardsCap: settings.newCardsCap,
        reviewCardsCap: settings.reviewCardsCap,
      }),
      this.statsRepo.getDailyStats(todayId)
    ]);

    if (signal?.aborted) throw new Error('Query aborted');

    let accuracy = 0;
    let rawSeconds = 0;

    if (stats && stats.totalReviews > 0) {
      accuracy = (stats.correctReviews / stats.totalReviews) * 100;
      accuracy = Math.max(0, Math.min(100, accuracy));
      rawSeconds = Math.max(0, Math.round(stats.totalTimeMs / 1000));
    }

    return Object.freeze({
      queueLength,
      reviewsCompletedToday: stats?.totalReviews || 0,
      todayAccuracyPercent: parseFloat(accuracy.toFixed(1)),
      studyTimeRawSeconds: rawSeconds,
    });
  }
}