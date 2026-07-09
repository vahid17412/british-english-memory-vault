export interface ISettingsRepository {
  readonly getSettingsRaw: () => Promise<unknown | null>;
  readonly saveSettingsRaw: (settings: unknown) => Promise<void>;
}
