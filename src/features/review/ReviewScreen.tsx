'use client';

import React from 'react';
import { useReviewSession } from './hooks/useReviewSession';
import { Flashcard } from './components/Flashcard';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';

export function ReviewScreen() {
  const { 
    currentCard, 
    isLoading, 
    error,
    isFinished, 
    isSubmitting,
    progress, 
    totalRemaining, 
    handleGrade 
  } = useReviewSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-xl text-gray-500 font-medium" role="status" aria-live="polite">
          {UI_CONSTANTS.REVIEW.LOADING_SESSION}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <div className="text-red-500 font-semibold mb-2">Error</div>
        <div className="text-gray-700 dark:text-gray-300">{error}</div>
      </div>
    );
  }

  if (isFinished || !currentCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {UI_CONSTANTS.REVIEW.SESSION_COMPLETE_TITLE}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {UI_CONSTANTS.REVIEW.SESSION_COMPLETE_DESC}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 px-4 py-8 md:py-12">
      <header className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {UI_CONSTANTS.REVIEW.DAILY_REVIEW}
          </h1>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400" aria-live="polite">
            {totalRemaining} {UI_CONSTANTS.REVIEW.CARDS_REMAINING}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <section aria-label="Flashcard section" className="w-full">
        <Flashcard 
          card={currentCard} 
          isSubmitting={isSubmitting} 
          onGrade={handleGrade} 
        />
      </section>
    </main>
  );
}
