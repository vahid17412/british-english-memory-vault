import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '@/config/dependencies';
import { AppSettings } from '@/domain/models/AppSettings';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  // Initial Load
  useEffect(() => {
    settingsService.getSettings().then(data => {
      setSettings(data);
      settingsService.applyTheme(data.theme);
    }).catch(e => ErrorReporter.report('LoadSettings', e));
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (fileReaderRef.current && fileReaderRef.current.readyState === FileReader.LOADING) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  const handleUpdateSetting = useCallback(async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    const updated: AppSettings = Object.freeze({ ...settings, ...updates });
    
    // Optimistic UI update
    setSettings(updated);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await settingsService.updateSettings(updated);
      setSuccessMessage(UI_CONSTANTS.SETTINGS.SAVE_SUCCESS);
    } catch (err) {
      ErrorReporter.report('UpdateSettings', err);
      setErrorMessage(UI_CONSTANTS.ERRORS.SUBMIT_FAILED);
    }
  }, [settings]);

  const handleAnkiExport = useCallback(async () => {
    setIsProcessing(true);
    try {
      await settingsService.triggerAnkiExport();
    } catch (e) {
      ErrorReporter.report('AnkiExport', e);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleJsonBackup = useCallback(async () => {
    setIsProcessing(true);
    try {
      await settingsService.triggerJsonBackup();
      setSuccessMessage(UI_CONSTANTS.SETTINGS.BACKUP_SUCCESS);
    } catch (e) {
      ErrorReporter.report('JsonBackup', e);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRestoreFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (fileReaderRef.current && fileReaderRef.current.readyState === FileReader.LOADING) {
      fileReaderRef.current.abort();
    }

    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = async (e) => {
      if (controller.signal.aborted) return;
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Invalid file format');
        
        await settingsService.executeRestore(text, controller.signal);
        
        if (controller.signal.aborted) return;
        
        // Re-apply settings/theme after successful restore (in case backup contained config in future)
        const refreshedSettings = await settingsService.getSettings();
        settingsService.applyTheme(refreshedSettings.theme);
        setSettings(refreshedSettings);

        setSuccessMessage(UI_CONSTANTS.SETTINGS.RESTORE_SUCCESS);
      } catch (err) {
        if (controller.signal.aborted) return;
        ErrorReporter.report('RestoreAction', err);
        setErrorMessage(UI_CONSTANTS.SETTINGS.ERR_INVALID_FILE);
      } finally {
        if (!controller.signal.aborted) setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      if (controller.signal.aborted) return;
      setErrorMessage(UI_CONSTANTS.SETTINGS.ERR_INVALID_FILE);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  }, []);

  return {
    settings,
    isProcessing,
    successMessage,
    errorMessage,
    handleUpdateSetting,
    handleAnkiExport,
    handleJsonBackup,
    handleRestoreFile
  };
}
