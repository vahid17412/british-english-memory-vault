import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IReviewRepository } from '@/repositories/contracts/IReviewRepository';
import { Card } from '@/domain/models/Card';
import { IClock } from '@/shared/interfaces/IClock';

export interface QueueConfig {
  readonly newCardsCap: number;
  readonly reviewCardsCap: number;
}

export class QueueBuilder {
  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly reviewRepo: IReviewRepository,
    private readonly clock: IClock
  ) {}

  async buildDailyQueue(config: QueueConfig): Promise<readonly Card[]> {
    const allCards = await this.cardRepo.getAll();
    const now = this.clock.now();

    const calculateScore = (card: Card): number => {
      const overdueDeltaMs = Math.max(0, now - card.nextReviewAt);
      const severityDays = overdueDeltaMs / (1000 * 60 * 60 * 24);
      const difficultyWeight = card.difficulty / 100;
      const recallPenalty = (100 - card.recallStrength) / 100;
      return severityDays + (difficultyWeight * 0.5) + (recallPenalty * 1.5);
    };

    const dueReviews = allCards
      .filter(c => (c.status === 'learning' || c.status === 'mature') && c.nextReviewAt <= now)
      .sort((a, b) => calculateScore(b) - calculateScore(a))
      .slice(0, config.reviewCardsCap);

    const potentialNewCards = allCards
      .filter(c => c.status === 'learning' && c.intervalDays === 0 && c.consecutiveSuccesses === 0)
      .sort((a, b) => a.createdAt - b.createdAt);

    const verifiedNewCards: Card[] = [];
    for (const card of potentialNewCards) {
      if (verifiedNewCards.length >= config.newCardsCap) break;
      const history = await this.reviewRepo.getByCardId(card.id);
      if (history.length === 0) {
        verifiedNewCards.push(card);
      }
    }

    return Object.freeze([...dueReviews, ...verifiedNewCards]);
  }

  /**
   * High-Performance Count Algorithm
   * Avoids deep allocations or array slicing.
   */
  async getDailyQueueCount(config: QueueConfig): Promise<number> {
    const allCards = await this.cardRepo.getAll();
    const now = this.clock.now();

    const dueCount = allCards.filter(
      c => (c.status === 'learning' || c.status === 'mature') && c.nextReviewAt <= now
    ).length;

    const potentialNew = allCards.filter(
      c => c.status === 'learning' && c.intervalDays === 0 && c.consecutiveSuccesses === 0
    );

    let newCount = 0;
    for (const card of potentialNew) {
      if (newCount >= config.newCardsCap) break;
      const history = await this.reviewRepo.getByCardId(card.id);
      if (history.length === 0) {
        newCount++;
      }
    }

    return Math.min(dueCount, config.reviewCardsCap) + newCount;
  }
}
