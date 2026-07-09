import React, { useRef } from 'react';
import { useSettings } from './hooks/useSettings';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';

export const SettingsScreen = React.memo(function SettingsScreen() {
  const {
    settings,
    isProcessing,
    successMessage,
    errorMessage,
    handleUpdateSetting,
    handleAnkiExport,
    handleJsonBackup,
    handleRestoreFile
  } = useSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!settings) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleRestoreFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNumberChange = (field: 'newCardsCap' | 'reviewCardsCap', valueStr: string) => {
    const value = Number(valueStr);
    if (Number.isNaN(value)) return;
    
    const max = field === 'newCardsCap' ? 500 : 5000;
    const clamped = Math.min(max, Math.max(1, value));
    handleUpdateSetting({ [field]: clamped });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 flex flex-col relative">
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="max-w-2xl w-full mx-auto flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{UI_CONSTANTS.SETTINGS.TITLE}</h1>

        {successMessage && <div role="status" className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium border border-green-100 dark:border-green-900/30 transition-all">{successMessage}</div>}
        {errorMessage && <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 transition-all">{errorMessage}</div>}

        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{UI_CONSTANTS.SETTINGS.THEME_LABEL}</h2>
          <div className="flex gap-3">
            <button
              disabled={isProcessing}
              onClick={() => handleUpdateSetting({ theme: 'light' })}
              className={`flex-1 py-3 rounded-xl font-medium border transition-all disabled:opacity-50 ${settings.theme === 'light' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
            >
              {UI_CONSTANTS.SETTINGS.THEME_LIGHT}
            </button>
            <button
              disabled={isProcessing}
              onClick={() => handleUpdateSetting({ theme: 'dark' })}
              className={`flex-1 py-3 rounded-xl font-medium border transition-all disabled:opacity-50 ${settings.theme === 'dark' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
            >
              {UI_CONSTANTS.SETTINGS.THEME_DARK}
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{UI_CONSTANTS.SETTINGS.SRS_CONFIG_TITLE}</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="newCardsCap" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{UI_CONSTANTS.SETTINGS.NEW_CARDS_LABEL}</label>
              <input
                id="newCardsCap"
                type="number"
                min={1}
                max={500}
                disabled={isProcessing}
                value={settings.newCardsCap}
                onChange={(e) => handleNumberChange('newCardsCap', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="reviewCardsCap" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{UI_CONSTANTS.SETTINGS.REVIEW_CARDS_LABEL}</label>
              <input
                id="reviewCardsCap"
                type="number"
                min={1}
                max={5000}
                disabled={isProcessing}
                value={settings.reviewCardsCap}
                onChange={(e) => handleNumberChange('reviewCardsCap', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{UI_CONSTANTS.SETTINGS.PORTABILITY_TITLE}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={isProcessing}
              onClick={handleAnkiExport}
              className="flex-1 py-3 px-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {UI_CONSTANTS.SETTINGS.EXPORT_ANKI_BTN}
            </button>
            <button
              disabled={isProcessing}
              onClick={handleJsonBackup}
              className="flex-1 py-3 px-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {UI_CONSTANTS.SETTINGS.BACKUP_GENERATE_BTN}
            </button>
          </div>
          
          <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{UI_CONSTANTS.SETTINGS.RESTORE_LABEL}</label>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              disabled={isProcessing}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 disabled:opacity-50"
            />
          </div>
        </section>
      </div>
    </main>
  );
});