export type SearchDocument = {
  readonly id: string;
  readonly canonicalForm: string;
  readonly englishMeaning: string;
};

export type SearchRequestMessage = 
  | { readonly type: 'INDEX_ALL'; readonly payload: readonly SearchDocument[] }
  | { readonly type: 'INDEX_CARD'; readonly payload: SearchDocument }
  | { readonly type: 'UPDATE_CARD'; readonly payload: SearchDocument }
  | { readonly type: 'REMOVE_CARD'; readonly id: string }
  | { readonly type: 'SEARCH'; readonly query: string; readonly limit: number; readonly reqId: string };

export type SearchResponseMessage = 
  | { readonly type: 'ACTION_SUCCESS' }
  | { readonly type: 'SEARCH_RESULT'; readonly reqId: string; readonly results: readonly string[] }
  | { readonly type: 'ERROR'; readonly error: string };
