import { Card } from '@/domain/models/Card';

export interface ICardRepository {
  readonly getById: (id: string) => Promise<Card | undefined>;
  readonly create: (card: Card) => Promise<void>;
  readonly update: (id: string, updates: Partial<Card>) => Promise<void>;
  readonly delete: (id: string) => Promise<void>;
  readonly bulkUpsert: (cards: readonly Card[]) => Promise<void>;
  readonly getAll: () => Promise<readonly Card[]>;
  readonly count: () => Promise<number>;
  readonly clear: () => Promise<void>;
}
