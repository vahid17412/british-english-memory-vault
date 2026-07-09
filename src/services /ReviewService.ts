import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IReviewRepository } from '@/repositories/contracts/IReviewRepository';
import { Scheduler } from '@/domain/srs/Scheduler';
import { ReviewPerformance, SRSMetrics } from '@/domain/srs/SRSTypes';
import { IEventBus } from '@/events/IEventBus';
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';
import { CardNotFoundError } from '@/domain/errors/CardErrors';

export class ReviewService {
  constructor(
    private readonly cardRepo: ICardRepository,
    private readonly reviewRepo: IReviewRepository,
    private readonly scheduler: Scheduler,
    private readonly clock: IClock,
    private readonly idGenerator: IIdGenerator,
    private readonly transactionManager: ITransactionManager,
    private readonly eventBus: IEventBus
  ) {}

  async submitReview(cardId: string, performance: ReviewPerformance): Promise<void> {
    let eventPayload: any = null;

    await this.transactionManager.runInTransaction(async () => {
      const card = await this.cardRepo.getById(cardId);
      if (!card) throw new CardNotFoundError(cardId);

      const oldMetrics: Readonly<SRSMetrics> = Object.freeze({
        difficulty: card.difficulty,
        recallStrength: card.recallStrength,
        intervalDays: card.intervalDays,
        consecutiveSuccesses: card.consecutiveSuccesses,
        consecutiveFailures: card.consecutiveFailures,
      });

      const result = this.scheduler.calculateNextReview(card.status, oldMetrics, performance);
      const now = this.clock.now();
      const reviewId = this.idGenerator.generate();

      const reviewRecord = Object.freeze({
        id: reviewId,
        cardId: card.id,
        isCorrect: performance.isCorrect,
        reviewTimeMs: performance.reviewTimeMs,
        hintUsageLevel: performance.hintUsageLevel,
        scheduledIntervalDays: oldMetrics.intervalDays,
        actualIntervalDays: result.updatedMetrics.intervalDays,
        timestamp: now,
        createdAt: now,
      });

      await this.cardRepo.update(cardId, {
        status: result.updatedStatus,
        difficulty: result.updatedMetrics.difficulty,
        recallStrength: result.updatedMetrics.recallStrength,
        intervalDays: result.updatedMetrics.intervalDays,
        consecutiveSuccesses: result.updatedMetrics.consecutiveSuccesses,
        consecutiveFailures: result.updatedMetrics.consecutiveFailures,
        nextReviewAt: now + (result.updatedMetrics.intervalDays * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });

      await this.reviewRepo.add(reviewRecord);

      eventPayload = Object.freeze({
        cardId,
        review: reviewRecord,
        oldMetrics,
        newMetrics: result.updatedMetrics,
      });
    });

    if (eventPayload) {
      await this.eventBus.publish({
        type: 'REVIEW_COMPLETED',
        payload: eventPayload,
      });
    }
  }
}