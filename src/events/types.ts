import { ReviewHistory } from '@/domain/models';
import { SRSMetrics } from '@/domain/srs/SRSTypes';

export interface ReviewCompletedEvent {
  readonly type: 'REVIEW_COMPLETED';
  readonly payload: {
    readonly cardId: string;
    readonly review: ReviewHistory;
    readonly oldMetrics: SRSMetrics;
    readonly newMetrics: SRSMetrics;
  };
}

export interface RestoreCompletedEvent {
  readonly type: 'RESTORE_COMPLETED';
  readonly payload: {
    readonly timestamp: number;
    readonly totalCardsRestored: number;
    readonly totalReviewsRestored: number;
  };
}

export type AppEvent = ReviewCompletedEvent | RestoreCompletedEvent;
