import { db } from '@/database/schema/AppDatabase';
import { ICardRepository } from '../contracts/ICardRepository';
import { Card } from '@/domain/models/Card';

export class CardRepositoryDexie implements ICardRepository {
  async getById(id: string): Promise<Card | undefined> {
    const raw = await db.cards.get(id);
    return raw ? Object.freeze({ ...raw }) : undefined;
  }

  async create(card: Card): Promise<void> {
    await db.transaction('rw', db.cards, async () => {
      await db.cards.add({ ...card });
    });
  }

  async update(id: string, updates: Partial<Card>): Promise<void> {
    const allowedFields = ['target', 'canonicalForm', 'englishMeaning', 'persianMeaning', 'ipa', 'status', 'difficulty', 'recallStrength', 'intervalDays', 'nextReviewAt', 'updatedAt', 'consecutiveSuccesses', 'consecutiveFailures'];
    const sanitized: any = {};
    for (const key of allowedFields) {
      if (key in updates && updates[key as keyof Card] !== undefined) {
        sanitized[key] = updates[key as keyof Card];
      }
    }
    await db.transaction('rw', db.cards, async () => {
      await db.cards.update(id, sanitized);
    });
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.cards, async () => {
      await db.cards.delete(id);
    });
  }

  async bulkUpsert(cards: readonly Card[]): Promise<void> {
    await db.transaction('rw', db.cards, async () => {
      await db.cards.bulkPut(cards.map(c => ({ ...c })));
    });
  }

  async getAll(): Promise<readonly Card[]> {
    const all = await db.cards.toArray();
    return Object.freeze(all.map(c => Object.freeze({ ...c })));
  }

  async count(): Promise<number> { 
    return await db.cards.count(); 
  }

  async clear(): Promise<void> { 
    await db.transaction('rw', db.cards, async () => {
      await db.cards.clear();
    });
  }

  async getByCanonicalForms(forms: readonly string[]): Promise<readonly Card[]> {
    if (forms.length === 0) return [];
    const results = await db.cards.where('canonicalForm').anyOf([...forms]).toArray();
    return Object.freeze(results.map(c => Object.freeze({ ...c })));
  }

  async getPaginated(offset: number, limit: number): Promise<readonly Card[]> {
    if (offset < 0 || limit <= 0) {
      throw new Error('[CardRepository] Invalid pagination parameters');
    }
    const results = await db.cards
      .orderBy('updatedAt')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
    return Object.freeze(results.map(c => Object.freeze({ ...c })));
  }
}