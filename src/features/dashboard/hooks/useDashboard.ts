import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '@/config/dependencies';
import { DashboardMetricsDTO } from '@/services/dashboard/DashboardService';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { eventBus } from '@/events/EventBus';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetricsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMetrics = useCallback(async (signal: AbortSignal) => {
    try {
      const data = await dashboardService.getTodayMetrics(signal);
      if (!signal.aborted) {
        setMetrics(data);
        setError(null);
      }
    } catch (err) {
      if (!signal.aborted) {
        ErrorReporter.report('useDashboard.loadMetrics', err);
        setError(UI_CONSTANTS.ERRORS.LOAD_FAILED);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadMetrics(controller.signal);

    // Reactive Auto-Refresh via EventBus boundary subscription
    const handleSystemEvent = () => {
      const freshController = new AbortController();
      abortControllerRef.current = freshController;
      loadMetrics(freshController.signal);
    };

    eventBus.subscribe('REVIEW_COMPLETED', handleSystemEvent);
    eventBus.subscribe('IMPORT_COMPLETED', handleSystemEvent);
    eventBus.subscribe('RESTORE_COMPLETED', handleSystemEvent);

    return () => {
      controller.abort();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [loadMetrics]);

  return { metrics, isLoading, error };
}
