import { Scheduler } from '../Scheduler';
import { Card } from '../../models/Card';
import { IClock } from '@/shared/interfaces/IClock';

describe('Scheduler Engine', () => {
  // 18: Fake Timers for time-dependent logic
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-07T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const mockNow = 1778112000000; // Exact timestamp for the fake date
  const mockClock: IClock = {
    now: () => mockNow,
    dateId: () => '2026-07-07'
  };

  const scheduler = new Scheduler(mockClock);

  // 7: Strict Object.freeze for base states
  const baseCard: Card = Object.freeze({
    id: '1',
    target: 'Test',
    canonicalForm: 'test',
    englishMeaning: 'Test meaning',
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

  it('should graduate card to mature and set precise interval', () => {
    const learningCard: Card = Object.freeze({ ...baseCard, consecutiveSuccesses: 3 });
    const performance = { isCorrect: true, reviewTimeMs: 1500, hintUsageLevel: 0 };
    
    // calculateNextReview was defined in Phase 3.1
    const result = scheduler.calculateNextReview(learningCard.status, learningCard, performance);

    expect(result.updatedStatus).toBe('mature');
    expect(result.updatedMetrics.consecutiveSuccesses).toBe(4);
    
    // 8: Exact numeric assertion instead of toBeGreaterThan
    expect(result.updatedMetrics.intervalDays).toBe(14); // MATURE_INITIAL_INTERVAL_DAYS
  });

  it('should reset interval on failure', () => {
    const matureCard: Card = Object.freeze({ 
      ...baseCard, 
      status: 'mature', 
      difficulty: 50, 
      intervalDays: 14, 
      consecutiveSuccesses: 5 
    });
    
    const performance = { isCorrect: false, reviewTimeMs: 4000, hintUsageLevel: 2 };
    const result = scheduler.calculateNextReview(matureCard.status, matureCard, performance);

    expect(result.updatedStatus).toBe('learning');
    expect(result.updatedMetrics.consecutiveSuccesses).toBe(0);
    expect(result.updatedMetrics.consecutiveFailures).toBe(1);
    expect(result.updatedMetrics.intervalDays).toBe(0);
    expect(result.updatedMetrics.difficulty).toBe(65); // 50 + 15
  });
});
