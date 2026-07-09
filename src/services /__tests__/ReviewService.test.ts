import { ReviewService } from '../ReviewService';
import { ICardRepository } from '@/repositories/contracts/ICardRepository';
import { IReviewRepository } from '@/repositories/contracts/IReviewRepository';
import { Scheduler } from '@/domain/srs/Scheduler';
import { IEventBus } from '@/events/IEventBus';
import { ITransactionManager } from '@/shared/interfaces/ITransactionManager';
import { IIdGenerator } from '@/shared/interfaces/IIdGenerator';
import { IClock } from '@/shared/interfaces/IClock';
import { Card } from '@/domain/models/Card';

describe('ReviewService Integration', () => {
  let cardRepo: jest.Mocked<ICardRepository>;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let eventBus: jest.Mocked<IEventBus>;
  let mockTxnManager: jest.Mocked<ITransactionManager>;
  let reviewService: ReviewService;

  const mockNow = 1778112000000;
  const mockClock: IClock = { now: () => mockNow, dateId: () => '2026-07-07' };
  
  // Deterministic UUID is handled globally, but we can explicitly inject here too
  const mockIdGen: IIdGenerator = { generate: () => 'fixed-uuid-99' };

  const dummyCard: Card = Object.freeze({
    id: 'card-1',
    target: 'Test',
    canonicalForm: 'test',
    englishMeaning: 'Test',
    type: 'word',
    status: 'learning',
    difficulty: 50,
    recallStrength: 0,
    intervalDays: 0,
    nextReviewAt: mockNow,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    createdAt: mockNow,
    updatedAt: mockNow,
  });

  beforeEach(() => {
    // 10: Complete TS Strict Mocks
    cardRepo = {
      getById: jest.fn().mockResolvedValue(dummyCard),
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      bulkUpsert: jest.fn().mockResolvedValue(undefined),
      getAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(1),
      clear: jest.fn().mockResolvedValue(undefined),
      getByCanonicalForms: jest.fn().mockResolvedValue([]),
      getPaginated: jest.fn().mockResolvedValue([]),
    };

    reviewRepo = {
      add: jest.fn().mockResolvedValue(undefined),
      addMany: jest.fn().mockResolvedValue(undefined),
      getByCardId: jest.fn().mockResolvedValue([]),
      getByDateRange: jest.fn().mockResolvedValue([]),
      getRecent: jest.fn().mockResolvedValue([]),
      getAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    // 11: Correct void signature for publish
    eventBus = {
      publish: jest.fn().mockReturnValue(undefined),
      subscribe: jest.fn(),
    };

    mockTxnManager = {
      runInTransaction: jest.fn().mockImplementation(async (op) => await op())
    };

    const scheduler = new Scheduler(mockClock);

    reviewService = new ReviewService(
      cardRepo,
      reviewRepo,
      scheduler,
      mockClock,
      mockIdGen,
      mockTxnManager,
      eventBus
    );
  });

  it('should process review, update card state accurately, save history, and publish event', async () => {
    const performance = { isCorrect: true, reviewTimeMs: 2000, hintUsageLevel: 1 };
    
    await reviewService.submitReview('card-1', performance);

    // 12: Ensure Transaction was used exactly once
    expect(mockTxnManager.runInTransaction).toHaveBeenCalledTimes(1);

    // 25: State Assertion - Check exact shape of the DB update
    expect(cardRepo.update).toHaveBeenCalledWith(
      'card-1',
      expect.objectContaining({
        status: 'learning',
        difficulty: 45, // 50 - 5
        recallStrength: 10, // 0 + 10
        intervalDays: 1, // Learning step [0, 1, 3, 7]
        consecutiveSuccesses: 1,
        consecutiveFailures: 0,
        nextReviewAt: mockNow + (1 * 86400000), // 9: Exact timestamp assertion
        updatedAt: mockNow,
      })
    );

    // 14: Assert exact Review History payload
    expect(reviewRepo.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'fixed-uuid-99',
        cardId: 'card-1',
        isCorrect: true,
        reviewTimeMs: 2000,
        hintUsageLevel: 1,
        scheduledIntervalDays: 0,
        actualIntervalDays: 1,
        timestamp: mockNow,
        createdAt: mockNow,
      })
    );

    // 15: Assert exact Event payload
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'REVIEW_COMPLETED',
      payload: expect.objectContaining({
        cardId: 'card-1',
        review: expect.objectContaining({
          id: 'fixed-uuid-99',
          isCorrect: true,
          timestamp: mockNow,
        }),
        oldMetrics: expect.any(Object),
        newMetrics: expect.any(Object),
      })
    });
  });

  // 13: Error Case Hardening
  it('should abort cleanly and throw CardNotFoundError if card does not exist', async () => {
    cardRepo.getById.mockResolvedValueOnce(undefined);
    
    await expect(
      reviewService.submitReview('invalid-id', { isCorrect: true, reviewTimeMs: 1000, hintUsageLevel: 0 })
    ).rejects.toThrow('Card with ID invalid-id not found'); // Based on Phase 4.1 error
    
    // Assert no mutations happened
    expect(mockTxnManager.runInTransaction).not.toHaveBeenCalled();
    expect(cardRepo.update).not.toHaveBeenCalled();
    expect(reviewRepo.add).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
