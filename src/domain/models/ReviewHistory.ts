export interface ReviewHistory {
  readonly id: string;
  readonly cardId: string;
  readonly isCorrect: boolean;
  readonly reviewTimeMs: number;
  readonly hintUsageLevel: number;
  readonly scheduledIntervalDays: number;
  readonly actualIntervalDays: number;
  readonly timestamp: number;
  readonly createdAt: number;
}
