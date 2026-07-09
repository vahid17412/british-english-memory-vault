import FlexSearch from 'flexsearch';
import { SearchRequestMessage, SearchResponseMessage } from '@/infrastructure/search/SearchWorkerTypes';
import { CanonicalEngine } from '@/domain/canonical/CanonicalEngine';

const index = new FlexSearch.Document({
  document: { id: 'id', index: ['canonicalForm', 'englishMeaning'] },
  tokenize: 'forward',
  cache: true,
});

self.onmessage = async (event: MessageEvent<SearchRequestMessage>) => {
  const { data } = event;

  try {
    if (data.type === 'INDEX_ALL') {
      for (const doc of data.payload) {
        index.add({
          id: doc.id,
          canonicalForm: CanonicalEngine.generateCanonicalForm(doc.canonicalForm),
          englishMeaning: doc.englishMeaning,
        });
      }
      self.postMessage({ type: 'ACTION_SUCCESS' } as SearchResponseMessage);
    } 
    else if (data.type === 'INDEX_CARD') {
      index.add({
        id: data.payload.id,
        canonicalForm: CanonicalEngine.generateCanonicalForm(data.payload.canonicalForm),
        englishMeaning: data.payload.englishMeaning,
      });
      self.postMessage({ type: 'ACTION_SUCCESS' } as SearchResponseMessage);
    }
    else if (data.type === 'UPDATE_CARD') {
      index.update({
        id: data.payload.id,
        canonicalForm: CanonicalEngine.generateCanonicalForm(data.payload.canonicalForm),
        englishMeaning: data.payload.englishMeaning,
      });
      self.postMessage({ type: 'ACTION_SUCCESS' } as SearchResponseMessage);
    }
    else if (data.type === 'REMOVE_CARD') {
      index.remove(data.id);
      self.postMessage({ type: 'ACTION_SUCCESS' } as SearchResponseMessage);
    }
    else if (data.type === 'SEARCH') {
      const normalizedQuery = CanonicalEngine.generateCanonicalForm(data.query);
      const searchResults = index.search(normalizedQuery, data.limit);
      
      const uniqueIds = new Set<string>();
      for (const group of (searchResults ?? [])) {
        const results = (group as any)?.result ?? [];
        for (const id of results) {
          if (typeof id === 'string') uniqueIds.add(id);
        }
      }

      self.postMessage({ 
        type: 'SEARCH_RESULT', 
        reqId: data.reqId, 
        results: Array.from(uniqueIds) 
      } as SearchResponseMessage);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error instanceof Error ? error.message : 'Unknown search worker error' 
    } as SearchResponseMessage);
  }
};
