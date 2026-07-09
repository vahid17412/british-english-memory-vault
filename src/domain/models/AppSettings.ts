// TODO: 'system' theme support can be added here in future iterations
export type AppTheme = 'light' | 'dark';

export interface AppSettings {
  readonly theme: AppTheme;
  readonly newCardsCap: number;
  readonly reviewCardsCap: number;
}
