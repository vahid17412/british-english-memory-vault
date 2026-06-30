import { ReviewHistory } from '@/domain/models/ReviewHistory';

export interface IReviewRepository {
  readonly add: (review: ReviewHistory) => Promise<void>;
  readonly addMany: (reviews: readonly ReviewHistory[]) => Promise<void>;
  readonly getByCardId: (cardId: string) => Promise<readonly ReviewHistory[]>;
  readonly getByDateRange: (from: number, to: number) => Promise<readonly ReviewHistory[]>;
  readonly getRecent: (limit: number) => Promise<readonly ReviewHistory[]>;
  readonly getAll: () => Promise<readonly ReviewHistory[]>;
  readonly count: () => Promise<number>;
  readonly clear: () => Promise<void>;
}
