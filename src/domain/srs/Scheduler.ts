import { CardLifecycleStatus, SRSMetrics, ReviewPerformance, SchedulingResult } from './SRSTypes';
import { SRSPolicy } from './SRSPolicy';
import { IClock } from '@/shared/interfaces/IClock';

export class Scheduler {
  constructor(private readonly clock: IClock) {}

  /**
   * Pure function to calculate the next SRS interval and state.
   * Enforces immutability: Returns a completely new state object without mutating input.
   */
  calculateNextReview(
    currentStatus: CardLifecycleStatus,
    metrics: SRSMetrics,
    performance: ReviewPerformance
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
      
      // Bounded difficulty and recall improvements
      nextDifficulty = Math.max(SRSPolicy.MIN_DIFFICULTY, metrics.difficulty + SRSPolicy.DIFFICULTY_ADJUSTMENT_CORRECT);
      nextRecallStrength = Math.min(SRSPolicy.RECALL_CAP, metrics.recallStrength + SRSPolicy.RECALL_BONUS_CORRECT);

      if (currentStatus === 'learning') {
        if (nextConsecutiveSuccesses >= SRSPolicy.MATURE_THRESHOLD_SUCCESSES) {
          updatedStatus = 'mature';
          nextIntervalDays = SRSPolicy.MATURE_INITIAL_INTERVAL_DAYS;
        } else {
          const stepIndex = Math.min(nextConsecutiveSuccesses, SRSPolicy.LEARNING_STEPS_DAYS.length - 1);
          nextIntervalDays = SRSPolicy.LEARNING_STEPS_DAYS[stepIndex];
        }
      } else if (currentStatus === 'mature') {
        const multiplier = SRSPolicy.BASE_MATURE_MULTIPLIER + ((SRSPolicy.DIFFICULTY_DECAY_FACTOR - nextDifficulty) / SRSPolicy.DIFFICULTY_DECAY_FACTOR);
        nextIntervalDays = Math.min(
          SRSPolicy.MAX_INTERVAL_DAYS, 
          Math.round(metrics.intervalDays * multiplier)
        );
      }
    } else {
      nextConsecutiveSuccesses = 0;
      nextConsecutiveFailures = metrics.consecutiveFailures + 1;
      
      // Bounded difficulty and recall penalties
      nextDifficulty = Math.min(SRSPolicy.MAX_DIFFICULTY, metrics.difficulty + SRSPolicy.DIFFICULTY_ADJUSTMENT_INCORRECT);
      nextRecallStrength = Math.max(SRSPolicy.MIN_RECALL, metrics.recallStrength - SRSPolicy.RECALL_PENALTY_INCORRECT);
      
      nextIntervalDays = 0; // Schedule for immediate review
      updatedStatus = 'learning'; // Demote back to learning phase
    }

    // Return a strictly new immutable object
    return {
      nextIntervalDays,
      updatedStatus,
      updatedMetrics: {
        difficulty: nextDifficulty,
        recallStrength: nextRecallStrength,
        intervalDays: nextIntervalDays,
        consecutiveSuccesses: nextConsecutiveSuccesses,
        consecutiveFailures: nextConsecutiveFailures
      }
    };
  }
}
