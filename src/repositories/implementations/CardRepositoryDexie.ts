import { db } from '@/database/schema/AppDatabase';
import { ICardRepository } from '../contracts/ICardRepository';
import { Card } from '@/domain/models/Card';
import { CardMapper } from '../mappers/CardMapper';

export class CardRepositoryDexie implements ICardRepository {
  async getById(id: string): Promise<Card | undefined> {
    const raw = await db.cards.get(id);
    return raw ? CardMapper.toDomain(raw) : undefined;
  }

  async create(card: Card): Promise<void> {
    await db.cards.add(CardMapper.toDB(card));
  }

  async update(id: string, updates: Partial<Card>): Promise<void> {
    // Whitelist sanitization
    const allowedFields = ['status', 'difficulty', 'recallStrength', 'intervalDays', 'nextReviewAt', 'updatedAt', 'archivedAt'];
    const sanitized: any = {};
    for (const key of allowedFields) {
      if (key in updates) sanitized[key] = (updates as any)[key];
    }
    await db.cards.update(id, sanitized);
  }

  async delete(id: string): Promise<void> {
    await db.cards.delete(id);
  }

  async bulkUpsert(cards: readonly Card[]): Promise<void> {
    await db.cards.bulkPut(cards.map(c => CardMapper.toDB(c)));
  }

  async getAll(): Promise<readonly Card[]> {
    const all = await db.cards.toArray();
    return Object.freeze(all.map(CardMapper.toDomain));
  }

  async count(): Promise<number> { return await db.cards.count(); }
  async clear(): Promise<void> { await db.cards.clear(); }
}
