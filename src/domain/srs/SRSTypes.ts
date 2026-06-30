export type CardLifecycleStatus = 'learning' | 'mature' | 'archived';

export interface SRSMetrics {
  readonly difficulty: number; // 0 to 100
  readonly recallStrength: number; // 0 to 100
  readonly intervalDays: number;
  readonly consecutiveSuccesses: number;
  readonly consecutiveFailures: number;
}

export interface ReviewPerformance {
  readonly isCorrect: boolean;
  readonly reviewTimeMs: number;
  readonly hintUsageLevel: number;
  
  // 🔥 FUTURE EXTENSION (Phase 3.1 Contract)
  readonly fuzzyRecallScore?: number;
  readonly hintPenaltyWeight?: number;
  readonly timeToAnswerWeight?: number;
}

export interface SchedulingResult {
  readonly nextIntervalDays: number;
  readonly updatedMetrics: SRSMetrics;
  readonly updatedStatus: CardLifecycleStatus;
}
