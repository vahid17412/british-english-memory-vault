'use client';

import React, { useMemo } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { INavigationService } from '@/shared/interfaces/INavigationService';

interface DashboardScreenProps {
  readonly navigationService: INavigationService;
}

interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly type: 'due' | 'neutral' | 'empty';
}

const MetricCard = React.memo(function MetricCard({ title, value, type }: MetricCardProps) {
  const colorMap = {
    due: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    empty: 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    neutral: 'bg-gray-50 border-gray-100 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorMap[type]} shadow-sm flex flex-col items-center justify-center text-center transition-all`}>
      <span className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">{title}</span>
      <span className="text-4xl font-bold tracking-tight">{value}</span>
    </div>
  );
});

export const DashboardScreen = React.memo(function DashboardScreen({ navigationService }: DashboardScreenProps) {
  const { metrics, isLoading, error } = useDashboard();

  const formattedStudyTime = useMemo(() => {
    if (!metrics) return '0s';
    const seconds = metrics.studyTimeRawSeconds;
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m`;
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center min-h-[50vh]" role="status" aria-live="polite">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center p-6 text-center min-h-[50vh]">
        <div className="text-red-500 font-semibold mb-2">Error</div>
        <div className="text-gray-700 dark:text-gray-300">{error}</div>
      </div>
    );
  }

  const isQueueEmpty = metrics.queueLength === 0;

  return (
    <div className="flex flex-col max-w-4xl w-full mx-auto p-4 md:p-8">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {UI_CONSTANTS.DASHBOARD.GREETING}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{UI_CONSTANTS.DASHBOARD.SUBTITLE}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title={UI_CONSTANTS.DASHBOARD.CARDS_DUE} 
          value={metrics.queueLength} 
          type={isQueueEmpty ? 'empty' : 'due'}
        />
        <MetricCard title={UI_CONSTANTS.DASHBOARD.TODAY_REVIEWS} value={metrics.reviewsCompletedToday} type="neutral" />
        <MetricCard title={UI_CONSTANTS.DASHBOARD.ACCURACY} value={`${metrics.todayAccuracyPercent}%`} type="neutral" />
        <MetricCard title={UI_CONSTANTS.DASHBOARD.STUDY_TIME} value={formattedStudyTime} type="neutral" />
      </div>

      <div className="flex justify-center md:justify-start">
        {isQueueEmpty ? (
          <div className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-medium text-center w-full md:w-auto border border-gray-200 dark:border-gray-700">
            {UI_CONSTANTS.DASHBOARD.QUEUE_EMPTY}
          </div>
        ) : (
          <button 
            onClick={() => navigationService.navigateTo('review')}
            className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all"
          >
            {UI_CONSTANTS.DASHBOARD.START_REVIEW_BTN}
          </button>
        )}
      </div>
    </div>
  );
});
