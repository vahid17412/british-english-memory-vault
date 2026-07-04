import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/domain/models/Card';
import { queueBuilder, reviewService, clock } from '@/config/dependencies';
import { APP_CONFIG, UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

export function useReviewSession() {
  const [queue, setQueue] = useState<readonly Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const initSession = async () => {
      try {
        const dailyQueue = await queueBuilder.buildDailyQueue({
          newCardsCap: APP_CONFIG.QUEUE.NEW_CARDS_CAP,
          reviewCardsCap: APP_CONFIG.QUEUE.REVIEW_CARDS_CAP
        });
        
        if (!controller.signal.aborted) {
          setQueue(dailyQueue);
          setIsLoading(false);
          setCardStartTime(clock.now());
        }
      } catch (err) {
        ErrorReporter.report('useReviewSession.initSession', err);
        if (!controller.signal.aborted) {
          setError(UI_CONSTANTS.ERRORS.LOAD_FAILED);
          setIsLoading(false);
        }
      }
    };

    initSession();

    return () => {
      controller.abort();
    };
  }, []);

  const handleGrade = useCallback(async (isCorrect: boolean, hintUsageLevel: number = 0) => {
    const currentCard = queue[currentIndex];
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    const reviewTimeMs = clock.now() - cardStartTime;

    try {
      await reviewService.submitReview(currentCard.id, {
        isCorrect,
        reviewTimeMs,
        hintUsageLevel
      });

      // Avoid advancing state if component unmounted mid-request
      if (abortControllerRef.current?.signal.aborted) return;

      setCurrentIndex(prev => prev + 1);
      setCardStartTime(clock.now());

    } catch (err) {
      ErrorReporter.report('useReviewSession.handleGrade', err);
      // Pointer is NOT advanced on failure
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsSubmitting(false);
      }
    }
  }, [queue, currentIndex, cardStartTime, isSubmitting]);

  const currentCard = currentIndex < queue.length ? queue[currentIndex] : null;
  const isFinished = !isLoading && queue.length > 0 && currentIndex >= queue.length;
  
  // Progress clamping
  let progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;
  progress = Math.min(Math.max(progress, 0), 100);

  const totalRemaining = Math.max(0, queue.length - currentIndex);

  return {
    currentCard,
    isLoading,
    error,
    isFinished,
    isSubmitting,
    progress,
    totalRemaining,
    handleGrade
  };
}
