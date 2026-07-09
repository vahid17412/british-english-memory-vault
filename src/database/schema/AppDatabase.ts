import Dexie, { Table } from 'dexie';
import { Card } from '@/domain/models/Card';
import { ReviewHistory } from '@/domain/models/ReviewHistory';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

export class AppDatabase extends Dexie {
  cards!: Table<Card, string>;
  reviewHistory!: Table<ReviewHistory, string>;

  constructor() {
    super('NaharPazSRSDatabase');

    this.version(1).stores({
      cards: 'id, canonicalForm, status, nextReviewAt, updatedAt',
      reviewHistory: 'id, cardId, timestamp'
    });
    
    this.on('blocked', () => {
      ErrorReporter.report('AppDatabase', new Error('Database upgrade blocked by another tab.'));
    });

    this.on('versionchange', () => {
      this.close(); // Prevent corruption during multi-tab version upgrades
    });
  }
}

export const db = new AppDatabase();
