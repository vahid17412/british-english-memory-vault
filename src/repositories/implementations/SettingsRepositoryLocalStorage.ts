import { ISettingsRepository } from '../contracts/ISettingsRepository';

export class SettingsRepositoryLocalStorage implements ISettingsRepository {
  private readonly STORAGE_KEY = 'naharpaz_srs_settings';

  async getSettingsRaw(): Promise<unknown | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveSettingsRaw(settings: unknown): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }
}
