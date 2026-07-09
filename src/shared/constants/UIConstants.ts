export const UI_CONSTANTS = {
  REVIEW: {
    LOADING_SESSION: 'Building daily session...',
    SESSION_COMPLETE_TITLE: 'Session Complete!',
    SESSION_COMPLETE_DESC: 'You have cleared your queue for now. The EventBus is silently crunching your statistics in the background.',
    DAILY_REVIEW: 'Daily Review',
    CARDS_REMAINING: 'cards remaining',
    TAP_TO_REVEAL: 'Tap to reveal answer',
    BTN_AGAIN: 'Again',
    BTN_GOT_IT: 'Got it',
  },
  ERRORS: {
    LOAD_FAILED: 'Failed to load data.',
    SUBMIT_FAILED: 'Failed to submit review. Please try again.',
  },
  BROWSER: {
    TITLE: 'Card Browser',
    SEARCH_PLACEHOLDER: 'Search vocabulary, idioms, or meanings...',
    NO_RESULTS: 'No cards found matching your query.',
    EMPTY_STATE: 'Your deck is empty. Import some cards to get started!',
    TOTAL_CARDS: 'Total Cards',
    CONFIRM_DELETE: 'Confirm',
    CANCEL_DELETE: 'Cancel',
    STATUS_LEARNING: 'Learning',
    STATUS_MATURE: 'Mature',
    LOAD_MORE: 'Load More',
    ERROR_FETCH: 'Failed to load cards. Please try again.',
  }
} as const;
