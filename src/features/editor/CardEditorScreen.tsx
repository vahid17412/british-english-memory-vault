'use client';

import React from 'react';
import { useCardEditor } from './hooks/useCardEditor';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

interface CardEditorScreenProps {
  readonly cardId?: string; 
  readonly onCancel?: () => void;
  readonly onSaved?: () => void;
}

// React.memo to prevent unnecessary re-renders of the entire layout wrapper
export const CardEditorScreen = React.memo(function CardEditorScreen({ cardId, onCancel, onSaved }: CardEditorScreenProps) {
  const { 
    formData, 
    errors, 
    generalError, 
    successMessage,
    isLoading, 
    isSubmitting, 
    handleChange, 
    handleSubmit 
  } = useCardEditor(cardId, onSaved);

  const title = cardId ? UI_CONSTANTS.EDITOR.TITLE_EDIT : UI_CONSTANTS.EDITOR.TITLE_ADD;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48" role="status" aria-live="polite">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {title}
      </h2>

      {/* Alert States */}
      {generalError && (
        <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 transition-all">
          {generalError}
        </div>
      )}
      
      {successMessage && (
        <div role="status" className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium border border-green-100 dark:border-green-900/30 transition-all animate-in fade-in">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {UI_CONSTANTS.EDITOR.TARGET_LABEL}
          </label>
          <input
            id="target"
            type="text"
            value={formData.target}
            onChange={(e) => handleChange('target', e.target.value)}
            maxLength={APP_CONFIG.EDITOR.MAX_TARGET_LENGTH}
            disabled={isSubmitting}
            autoComplete="off"
            spellCheck={false}
            autoCorrect="off"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              errors.target ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {errors.target && <p className="mt-1 text-sm text-red-500">{errors.target}</p>}
        </div>

        {/* ... (English, Persian, and IPA Textareas remain the same) ... */}
        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {isSubmitting ? UI_CONSTANTS.EDITOR.SAVING : UI_CONSTANTS.EDITOR.SAVE_BTN}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {UI_CONSTANTS.EDITOR.CANCEL_BTN}
            </button>
          )}
        </div>
      </form>
    </div>
  );
});
