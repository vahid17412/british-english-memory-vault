import { CardLifecycleStatus, SRSMetrics, ReviewPerformance, SchedulingResult } from './SRSTypes';
import { SRSPolicy } from './SRSPolicy';
import { IClock } from '@/shared/interfaces/IClock';

export class Scheduler {
  constructor(private readonly clock: IClock) {}

  calculateNextReview(
    currentStatus: CardLifecycleStatus,
    metrics: Readonly<SRSMetrics>,
    performance: Readonly<ReviewPerformance>
  ): SchedulingResult {
    let nextDifficulty = metrics.difficulty;
    let nextRecallStrength = metrics.recallStrength;
    let nextConsecutiveSuccesses = metrics.consecutiveSuccesses;
    let nextConsecutiveFailures = metrics.consecutiveFailures;
    
    let nextIntervalDays = 0;
    let updatedStatus = currentStatus;

    if (performance.isCorrect) {
      nextConsecutiveSuccesses = metrics.consecutiveSuccesses + 1;
      nextConsecutiveFailures = 0;
      
      nextDifficulty = metrics.difficulty + SRSPolicy.DIFFICULTY_ADJUSTMENT_CORRECT;
      nextRecallStrength = metrics.recallStrength + SRSPolicy.RECALL_BONUS_CORRECT;

      if (currentStatus === 'learning') {
        if (nextConsecutiveSuccesses >= SRSPolicy.MATURE_THRESHOLD_SUCCESSES) {
          updatedStatus = 'mature';
          nextIntervalDays = SRSPolicy.MATURE_INITIAL_INTERVAL_DAYS;
        } else {
          const stepIndex = Math.min(nextConsecutiveSuccesses, SRSPolicy.LEARNING_STEPS_DAYS.length - 1);
          nextIntervalDays = SRSPolicy.LEARNING_STEPS_DAYS[stepIndex];
        }
      } else if (currentStatus === 'mature') {
        const multiplier = SRSPolicy.BASE_MATURE_MULTIPLIER + ((SRSPolicy.DIFFICULTY_DECAY_FACTOR - Math.max(0, Math.min(100, nextDifficulty))) / SRSPolicy.DIFFICULTY_DECAY_FACTOR);
        nextIntervalDays = Math.round(metrics.intervalDays * multiplier);
      }
    } else {
      nextConsecutiveSuccesses = 0;
      nextConsecutiveFailures = metrics.consecutiveFailures + 1;
      
      nextDifficulty = metrics.difficulty + SRSPolicy.DIFFICULTY_ADJUSTMENT_INCORRECT;
      nextRecallStrength = metrics.recallStrength - SRSPolicy.RECALL_PENALTY_INCORRECT;
      
      nextIntervalDays = 0;
      updatedStatus = 'learning';
    }

    // Strict clamping to ensure valid boundaries
    nextDifficulty = Math.max(SRSPolicy.MIN_DIFFICULTY, Math.min(SRSPolicy.MAX_DIFFICULTY, nextDifficulty));
    nextRecallStrength = Math.max(SRSPolicy.MIN_RECALL, Math.min(SRSPolicy.RECALL_CAP, nextRecallStrength));
    nextIntervalDays = Math.max(0, Math.min(SRSPolicy.MAX_INTERVAL_DAYS, nextIntervalDays));

    return Object.freeze({
      nextIntervalDays,
      updatedStatus,
      updatedMetrics: Object.freeze({
        difficulty: nextDifficulty,
        recallStrength: nextRecallStrength,
        intervalDays: nextIntervalDays,
        consecutiveSuccesses: nextConsecutiveSuccesses,
        consecutiveFailures: nextConsecutiveFailures
      })
    });
  }
}