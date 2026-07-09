import { ISettingsRepository } from '@/repositories/contracts/ISettingsRepository';
import { AppSettings, AppTheme } from '@/domain/models/AppSettings';
import { SettingsSchema } from '@/infrastructure/security/SettingsValidator';
import { BackupRestoreService } from '@/services/backup/BackupRestoreService';
import { AnkiExportService } from '@/services/export/AnkiExportService';
import { APP_CONFIG } from '@/shared/constants/AppConfig';

export class SettingsService {
  private readonly defaultSettings: AppSettings = Object.freeze({
    theme: 'light',
    newCardsCap: APP_CONFIG.QUEUE.NEW_CARDS_CAP,
    reviewCardsCap: APP_CONFIG.QUEUE.REVIEW_CARDS_CAP,
  });

  constructor(
    private readonly settingsRepo: ISettingsRepository,
    private readonly backupRestoreService: BackupRestoreService,
    private readonly ankiExportService: AnkiExportService
  ) {}

  async getSettings(): Promise<AppSettings> {
    const raw = await this.settingsRepo.getSettingsRaw();
    if (!raw) return this.defaultSettings;

    const result = SettingsSchema.safeParse(raw);
    if (result.success) {
      return Object.freeze(result.data);
    }
    
    // Fallback to defaults if schema is corrupted
    return this.defaultSettings;
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    const validSettings = SettingsSchema.parse(settings); // Throws if invalid, protecting the DB
    await this.settingsRepo.saveSettingsRaw(validSettings);
    this.applyTheme(validSettings.theme);
  }

  applyTheme(theme: AppTheme): void {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  async triggerAnkiExport(): Promise<void> {
    const txtContent = await this.ankiExportService.generateTxtExport();
    this.downloadFile(txtContent, 'anki_deck_export.txt', 'text/plain;charset=utf-8');
  }

  async triggerJsonBackup(): Promise<void> {
    const jsonContent = await this.backupRestoreService.generateFullBackup();
    this.downloadFile(jsonContent, 'srs_database_backup.json', 'application/json;charset=utf-8');
  }

  async executeRestore(fileContent: string, signal?: AbortSignal): Promise<void> {
    await this.backupRestoreService.restoreFromBackup(fileContent, signal);
  }

  private downloadFile(content: string, fileName: string, contentType: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    // Prevent Safari/iOS memory leaks
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}
