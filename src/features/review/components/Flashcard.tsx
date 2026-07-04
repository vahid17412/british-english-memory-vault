import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Card } from '@/domain/models/Card';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';

interface FlashcardProps {
  readonly card: Card;
  readonly isSubmitting: boolean;
  readonly onGrade: (isCorrect: boolean, hintLevel: number) => void;
}

export function Flashcard({ card, isSubmitting, onGrade }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = () => {
    if (!isFlipped) setIsFlipped(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      <div 
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Flashcard answer revealed" : "Tap to reveal flashcard answer"}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[300px] p-8 rounded-2xl shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer border focus:outline-none focus:ring-4 focus:ring-blue-500 ${
          isFlipped ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
        }`}
      >
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          {card.target}
        </h2>
        
        {card.ipa && (
          <p className="text-lg text-gray-500 dark:text-gray-400 font-mono mb-4">
            /{card.ipa}/
          </p>
        )}

        {!isFlipped ? (
          <div className="mt-8 text-blue-500 dark:text-blue-400 font-medium">
            {UI_CONSTANTS.REVIEW.TAP_TO_REVEAL}
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 w-full">
            <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
              {card.englishMeaning}
            </p>
            {card.persianMeaning && (
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400" dir="rtl">
                {card.persianMeaning}
              </p>
            )}
          </div>
        )}
      </div>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            disabled={isSubmitting}
            aria-label="Mark as incorrect"
            onClick={(e) => { e.stopPropagation(); onGrade(false, 0); }}
            className="py-4 px-6 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
            {UI_CONSTANTS.REVIEW.BTN_AGAIN}
          </button>
          <button 
            disabled={isSubmitting}
            aria-label="Mark as correct"
            onClick={(e) => { e.stopPropagation(); onGrade(true, 0); }}
            className="py-4 px-6 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          >
            {UI_CONSTANTS.REVIEW.BTN_GOT_IT}
          </button>
        </div>
      )}
    </div>
  );
}
