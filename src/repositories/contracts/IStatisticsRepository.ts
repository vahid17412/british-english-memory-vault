import { DailySessionStats } from '@/domain/models/Statistics';

export interface IStatisticsRepository {
  readonly getDailyStats: (dateId: string) => Promise<DailySessionStats | null>;
  readonly saveDailyStats: (stats: DailySessionStats) => Promise<void>;
  readonly incrementDailyStats: (dateId: string, delta: Partial<DailySessionStats>) => Promise<void>;
  readonly getRange: (fromDateId: string, toDateId: string) => Promise<readonly DailySessionStats[]>;
}