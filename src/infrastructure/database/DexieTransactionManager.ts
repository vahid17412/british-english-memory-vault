import { db } from '@/database/schema/AppDatabase';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';

export class DexieTransactionManager implements ITransactionManager {
  async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    // Lock all necessary tables for a full read-write transaction
    return await db.transaction('rw', db.cards, db.examples, db.tags, db.cardTags, db.reviewHistory, async () => {
      return await operation();
    });
  }
}
