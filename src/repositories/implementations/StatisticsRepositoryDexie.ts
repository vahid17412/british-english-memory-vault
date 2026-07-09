import { db } from '@/database/schema/AppDatabase';
import { IStatisticsRepository } from '../contracts/IStatisticsRepository';
import { DailySessionStats } from '@/domain/models/Statistics';

export class StatisticsRepositoryDexie implements IStatisticsRepository {
  // Note: Assumes a 'dailyStats' table exists in AppDatabase with 'id' (dateId) as primary key.
  
  async getDailyStats(dateId: string): Promise<DailySessionStats | null> {
    const table = (db as any).dailyStats;
    if (!table) return null;
    
    const raw = await table.get(dateId);
    return raw ? Object.freeze({ ...raw }) : null;
  }

  async saveDailyStats(stats: DailySessionStats): Promise<void> {
    const table = (db as any).dailyStats;
    if (!table) return;
    
    await db.transaction('rw', table, async () => {
      await table.put({ ...stats });
    });
  }

  async incrementDailyStats(dateId: string, delta: Partial<DailySessionStats>): Promise<void> {
    const table = (db as any).dailyStats;
    if (!table) return;

    await db.transaction('rw', table, async () => {
      const existing = await table.get(dateId);
      
      const updated: DailySessionStats = {
        id: dateId,
        totalReviews: (existing?.totalReviews || 0) + (delta.totalReviews || 0),
        correctReviews: (existing?.correctReviews || 0) + (delta.correctReviews || 0),
        incorrectReviews: (existing?.incorrectReviews || 0) + (delta.incorrectReviews || 0),
        totalTimeMs: (existing?.totalTimeMs || 0) + (delta.totalTimeMs || 0),
      };

      await table.put(updated);
    });
  }

  async getRange(fromDateId: string, toDateId: string): Promise<readonly DailySessionStats[]> {
    const table = (db as any).dailyStats;
    if (!table) return [];

    const results = await table.where('id').between(fromDateId, toDateId, true, true).toArray();
    return Object.freeze(results.map((r: DailySessionStats) => Object.freeze({ ...r })));
  }
}
