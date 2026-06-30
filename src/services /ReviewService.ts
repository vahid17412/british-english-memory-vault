import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IReviewRepository } from '@/repositories/contracts/IReviewRepository';
import { Scheduler } from '@/domain/srs/Scheduler';
import { ReviewPerformance, SRSMetrics } from '@/domain/srs/SRSTypes';
import { IEventBus } from '@/events/IEventBus';
import { IClock } from '@/shared/interfaces/IClock';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';

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
    const card = await this.cardRepo.getById(cardId);
    if (!card) throw new Error(`Card with ID ${cardId} not found.`);

    const oldMetrics: Readonly<SRSMetrics> = {
      difficulty: card.difficulty,
      recallStrength: card.recallStrength,
      intervalDays: card.intervalDays,
      consecutiveSuccesses: card.consecutiveSuccesses,
      consecutiveFailures: card.consecutiveFailures,
    };

    const result = this.scheduler.calculateNextReview(card.status, oldMetrics, performance);
    const now = this.clock.now();
    const reviewId = this.idGenerator.generate();

    const reviewRecord = {
      id: reviewId,
      cardId: card.id,
      isCorrect: performance.isCorrect,
      reviewTimeMs: performance.reviewTimeMs,
      hintUsageLevel: performance.hintUsageLevel,
      scheduledIntervalDays: oldMetrics.intervalDays,
      actualIntervalDays: result.nextIntervalDays, // Extracted directly from scheduling bounds
      timestamp: now,
      createdAt: now,
    };

    // Transactional Boundary: Ensures atomic persistence with rollback capability
    await this.transactionManager.runInTransaction(async () => {
      await this.cardRepo.update(cardId, {
        status: result.updatedStatus,
        difficulty: result.updatedMetrics.difficulty,
        recallStrength: result.updatedMetrics.recallStrength,
        intervalDays: result.updatedMetrics.intervalDays,
        consecutiveSuccesses: result.updatedMetrics.consecutiveSuccesses,
        consecutiveFailures: result.updatedMetrics.consecutiveFailures,
        nextReviewAt: now + (result.nextIntervalDays * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });

      await this.reviewRepo.add(reviewRecord);
    });

    // Fire non-blocking event
    this.eventBus.publish({
      type: 'REVIEW_COMPLETED',
      payload: {
        cardId,
        review: reviewRecord,
        oldMetrics,
        newMetrics: result.updatedMetrics,
      },
    });
  }
}
