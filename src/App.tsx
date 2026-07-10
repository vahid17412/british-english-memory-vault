import React, { useState } from 'react';
import { AppShell, AppRoute } from '@/features/layout/AppShell';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { ReviewScreen } from '@/features/review/ReviewScreen';
import { BrowserScreen } from '@/features/browser/BrowserScreen';
import { EditorScreen } from '@/features/editor/EditorScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

export const App = () => {
  // مدیریت مسیریابی (Routing) صفحات برنامه
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');

  return (
    <AppShell currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {currentRoute === 'home' && <DashboardScreen />}
      {currentRoute === 'review' && <ReviewScreen />}
      {currentRoute === 'browser' && <BrowserScreen />}
      {currentRoute === 'editor' && <EditorScreen />}
      {currentRoute === 'settings' && <SettingsScreen />}
    </AppShell>
  );
};
