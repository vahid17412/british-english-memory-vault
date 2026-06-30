export interface Card {
  readonly id: string;
  readonly canonicalForm: string;
  readonly target: string;
  readonly type: 'word' | 'expression' | 'chunk' | 'collocation' | 'phrasalVerb' | 'idiom' | 'pattern' | 'sentence';
  readonly ipa?: string;
  readonly englishMeaning: string;
  readonly persianMeaning?: string;
  readonly status: 'learning' | 'mature' | 'archived';
  readonly difficulty: number;
  readonly recallStrength: number;
  readonly intervalDays: number;
  readonly nextReviewAt: number;
  readonly consecutiveSuccesses: number;
  readonly consecutiveFailures: number;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly archivedAt?: number;
  readonly deletedAt?: number;
  readonly metadata?: Record<string, unknown>;
}
