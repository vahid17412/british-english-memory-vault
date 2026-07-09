import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/domain/models/Card';
import { cardRepo, searchService } from '@/config/dependencies';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

export function useCardBrowser() {
  const [cards, setCards] = useState<readonly Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reindexDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCards = useCallback(async (query: string, signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      let results: readonly Card[];
      if (query.trim() === '') {
        results = await cardRepo.getPaginated(0, APP_CONFIG.BROWSER.PAGE_SIZE);
      } else {
        try {
          results = await searchService.searchCards(query, APP_CONFIG.BROWSER.PAGE_SIZE);
        } catch (searchError) {
          ErrorReporter.report('useCardBrowser.searchService (Fallback Triggered)', searchError);
          results = await cardRepo.getPaginated(0, APP_CONFIG.BROWSER.PAGE_SIZE);
        }
      }
      
      if (!signal.aborted) {
        setCards(results);
      }
    } catch (err) {
      if (!signal.aborted) {
        ErrorReporter.report('useCardBrowser.fetchCards', err);
        setError('Failed to fetch cards');
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cardRepo.count().then(setTotalCount).catch(e => ErrorReporter.report('useCardBrowser.count', e));
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      fetchCards(searchQuery, controller.signal);
    }, APP_CONFIG.BROWSER.SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, fetchCards]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await cardRepo.delete(id);
      setCards(prev => prev.filter(c => c.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      if (reindexDebounceRef.current) clearTimeout(reindexDebounceRef.current);
      reindexDebounceRef.current = setTimeout(() => {
        searchService.reindexAll().catch(e => ErrorReporter.report('Background Reindex', e));
      }, APP_CONFIG.BROWSER.REINDEX_DEBOUNCE_MS);
      
    } catch (err) {
      ErrorReporter.report('useCardBrowser.handleDelete', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (reindexDebounceRef.current) clearTimeout(reindexDebounceRef.current);
    };
  }, []);

  return {
    cards,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    totalCount,
    handleDelete
  };
}
