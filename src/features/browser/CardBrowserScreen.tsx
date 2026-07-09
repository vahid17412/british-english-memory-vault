'use client';

import React from 'react';
import { useCardBrowser } from './hooks/useCardBrowser';
import { CardListItem } from './components/CardListItem';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';

export function CardBrowserScreen() {
  const { 
    cards, 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    error,
    totalCount, 
    handleDelete 
  } = useCardBrowser();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 flex flex-col">
      <header className="max-w-4xl w-full mx-auto mb-8">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {UI_CONSTANTS.BROWSER.TITLE}
          </h1>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            {UI_CONSTANTS.BROWSER.TOTAL_CARDS}: {totalCount}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={UI_CONSTANTS.BROWSER.SEARCH_PLACEHOLDER}
            autoComplete="off"
            spellCheck={false}
            autoCorrect="off"
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            aria-label="Search cards"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </header>

      <section className="max-w-4xl w-full mx-auto flex-1" aria-live="polite">
        {error ? (
          <div className="text-center py-12 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-2xl">
            {UI_CONSTANTS.BROWSER.ERROR_FETCH}
          </div>
        ) : isLoading && cards.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? UI_CONSTANTS.BROWSER.NO_RESULTS : UI_CONSTANTS.BROWSER.EMPTY_STATE}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map(card => (
              <CardListItem key={card.id} card={card} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
