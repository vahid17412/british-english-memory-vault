import { IEventBus } from '@/events/IEventBus';
import { ReviewCompletedEvent } from '@/events/types';
import { StatsService } from '@/services/StatsService';
import { IClock } from '@/shared/interfaces/IClock';

export class ReviewCompletedHandler {
  private readonly handlerRef = this.handle.bind(this);
  private eventBuffer: ReviewCompletedEvent[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly BUFFER_WINDOW_MS = 250;

  constructor(
    private readonly eventBus: IEventBus,
    private readonly statsService: StatsService,
    private readonly clock: IClock
  ) {}

  /**
   * Lifecycle Control: Attaches the isolated event listener.
   */
  init(): void {
    this.eventBus.subscribe<ReviewCompletedEvent>('REVIEW_COMPLETED', this.handlerRef);
  }

  /**
   * Lifecycle Control: Cleans up memory (CRITICAL for testing & hot-reloading).
   */
  dispose(): void {
    if (this.flushTimeout) clearTimeout(this.flushTimeout);
    this.eventBuffer = [];
  }

  private handle(event: ReviewCompletedEvent): void {
    this.eventBuffer.push(event);

    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), this.BUFFER_WINDOW_MS);
    }
  }

  private async flush(): Promise<void> {
    const batch = [...this.eventBuffer];
    this.eventBuffer = [];
    this.flushTimeout = null;

    // Process batch sequentially to maintain statistical integrity
    for (const event of batch) {
      const { review } = event.payload;
      const dateId = this.clock.dateId(review.timestamp);

      try {
        await this.statsService.processReview(dateId, {
          isCorrect: review.isCorrect,
          reviewTimeMs: review.reviewTimeMs,
          hintUsageLevel: review.hintUsageLevel,
        });
      } catch (e) {
        // Logging is handled by StatsService retry logic
      }
    }
  }
}
