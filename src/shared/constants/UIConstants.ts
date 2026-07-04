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
    LOAD_FAILED: 'Failed to load review queue.',
    SUBMIT_FAILED: 'Failed to submit review. Please try again.',
  }
} as const;

export const APP_CONFIG = {
  QUEUE: {
    NEW_CARDS_CAP: 20,
    REVIEW_CARDS_CAP: 100,
  }
} as const;
