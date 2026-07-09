import { db } from '@/database/schema/AppDatabase';
import { IReviewRepository } from '../contracts/IReviewRepository';
import { ReviewHistory } from '@/domain/models/ReviewHistory';

export class ReviewRepositoryDexie implements IReviewRepository {
  async add(review: ReviewHistory): Promise<void> {
    await db.transaction('rw', db.reviewHistory, async () => {
      await db.reviewHistory.add({ ...review });
    });
  }
  
  async addMany(reviews: readonly ReviewHistory[]): Promise<void> {
    await db.transaction('rw', db.reviewHistory, async () => {
      await db.reviewHistory.bulkAdd(reviews.map(r => ({ ...r })));
    });
  }
  
  async getByCardId(cardId: string): Promise<readonly ReviewHistory[]> {
    const results = await db.reviewHistory.where('cardId').equals(cardId).toArray();
    return Object.freeze(results.map(r => Object.freeze({ ...r })));
  }
  
  async getByDateRange(from: number, to: number): Promise<readonly ReviewHistory[]> {
    const results = await db.reviewHistory.where('timestamp').between(from, to).toArray();
    return Object.freeze(results.map(r => Object.freeze({ ...r })));
  }
  
  async getRecent(limit: number): Promise<readonly ReviewHistory[]> {
    const results = await db.reviewHistory.orderBy('timestamp').reverse().limit(limit).toArray();
    return Object.freeze(results.map(r => Object.freeze({ ...r })));
  }
  
  async getAll(): Promise<readonly ReviewHistory[]> {
    const results = await db.reviewHistory.toArray();
    return Object.freeze(results.map(r => Object.freeze({ ...r })));
  }
  
  async count(): Promise<number> {
    return await db.reviewHistory.count();
  }
  
  async clear(): Promise<void> {
    await db.transaction('rw', db.reviewHistory, async () => {
      await db.reviewHistory.clear();
    });
  }
}