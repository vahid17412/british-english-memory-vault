import Dexie, { Table } from 'dexie';
import { Card, Example, Tag, CardTag, ReviewHistory } from '@/domain/models';

const DATABASE_NAME = 'MemoryVaultDB';

export class AppDatabase extends Dexie {
  cards!: Table<Card, string>;
  examples!: Table<Example, string>;
  tags!: Table<Tag, string>;
  cardTags!: Table<CardTag, string>;
  reviewHistory!: Table<ReviewHistory, string>;

  constructor() {
    super(DATABASE_NAME);

    // Schema defined with architectural indices
    this.version(1).stores({
      cards: 'id, canonicalForm, status, nextReviewAt, updatedAt, deletedAt',
      examples: 'id, cardId',
      tags: 'id, name',
      cardTags: '[cardId+tagId], cardId, tagId',
      reviewHistory: 'id, cardId, timestamp'
    });
  }
}

export const db = new AppDatabase();
