import React, { useState } from 'react';
import { Card } from '@/domain/models/Card';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';

interface CardListItemProps {
  readonly card: Card;
  readonly onDelete: (id: string) => void;
}

export const CardListItem = React.memo(function CardListItem({ card, onDelete }: CardListItemProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDeleteRequest = () => setIsConfirming(true);
  const handleCancelDelete = () => setIsConfirming(false);
  const handleConfirmDelete = () => onDelete(card.id);

  const statusColor = card.status === 'mature' 
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';

  const statusText = card.status === 'mature' 
    ? UI_CONSTANTS.BROWSER.STATUS_MATURE 
    : UI_CONSTANTS.BROWSER.STATUS_LEARNING;

  const hasValidMetrics = card.difficulty >= 0 && card.recallStrength >= 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-1 w-full sm:w-2/3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {card.target}
          </span>
          <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider ${statusColor}`}>
            {statusText}
          </span>
        </div>
        <span className="text-gray-600 dark:text-gray-400 truncate">
          {card.englishMeaning}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
        {hasValidMetrics && (
          <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
            <span>Diff: {Math.round(card.difficulty)}%</span>
            <span>Recall: {Math.round(card.recallStrength)}%</span>
          </div>
        )}
        
        {isConfirming ? (
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {UI_CONSTANTS.BROWSER.CONFIRM_DELETE}
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {UI_CONSTANTS.BROWSER.CANCEL_DELETE}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDeleteRequest}
            aria-label={`Delete ${card.target}`}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});
