import React, { ReactNode, useMemo } from 'react';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { APP_CONFIG } from '@/shared/constants/AppConfig';
import { usePWAStatus } from '../pwa/hooks/usePWAStatus';

interface AppShellProps {
  readonly children: ReactNode;
  readonly currentRoute?: string;
  readonly onNavigate: (route: string) => void;
}

const HomeIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ReviewIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BrowserIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const EditorIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export const AppShell = React.memo(function AppShell({ children, currentRoute = 'home', onNavigate }: AppShellProps) {
  const { isOnline, isInstallable, triggerNativeInstall, showUpdateAlert, reloadAppFn, setShowUpdateAlert } = usePWAStatus();
  
  const navItems = useMemo(() => [
    { id: 'home', label: UI_CONSTANTS.NAVIGATION.HOME, Icon: HomeIcon },
    { id: 'review', label: UI_CONSTANTS.NAVIGATION.REVIEW, Icon: ReviewIcon },
    { id: 'browser', label: UI_CONSTANTS.NAVIGATION.BROWSER, Icon: BrowserIcon },
    { id: 'editor', label: UI_CONSTANTS.NAVIGATION.EDITOR, Icon: EditorIcon },
  ], []);

  const safeAreaBottomStyle = {
    paddingBottom: 'calc(var(--safe-area-inset-bottom, 0px) + 0.25rem)'
  };

  const hasTopBanner = !isOnline || showUpdateAlert;

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 font-sans ${hasTopBanner ? 'pt-8' : ''}`}>
      
      {!isOnline && (
        <div role="alert" className="fixed top-0 left-0 right-0 h-8 bg-amber-500 text-white text-center text-xs font-semibold flex items-center justify-center z-[100] shadow-sm">
          Offline Mode. Your data is safely stored locally.
        </div>
      )}
      
      {showUpdateAlert && isOnline && (
        <div role="alert" className="fixed top-0 left-0 right-0 h-8 bg-blue-600 text-white flex items-center justify-between px-4 z-[100] shadow-sm">
          <span className="text-xs font-semibold">A new version is available!</span>
          <div className="flex gap-3">
            <button onClick={() => reloadAppFn?.()} className="text-xs bg-white text-blue-600 px-3 py-1 rounded font-bold shadow-sm">Update</button>
            <button onClick={() => setShowUpdateAlert(false)} className="text-xs text-blue-100">Later</button>
          </div>
        </div>
      )}

      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r h-screen sticky top-0 p-4">
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-8 px-4 mt-4">
          {APP_CONFIG.APP_NAME}
        </div>
        <ul className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = currentRoute === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left focus:outline-none ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.Icon />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-1 flex flex-col pb-20 md:pb-0 overflow-y-auto relative">
        {isInstallable && (
          <div className="bg-blue-50 border-b p-3 flex justify-between items-center px-4 md:px-8">
            <span className="text-xs md:text-sm text-blue-700 font-medium">Install app for offline access and faster performance.</span>
            <button onClick={triggerNativeInstall} className="text-xs md:text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg">Install App</button>
          </div>
        )}
        {children}
      </div>

      <nav 
        style={safeAreaBottomStyle}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t z-50 px-2 pt-1"
      >
        <ul className="flex justify-around items-center h-16">
          {navItems.map(item => {
            const isActive = currentRoute === item.id;
            return (
              <li key={item.id} className="flex-1 flex justify-center">
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 focus:outline-none ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <item.Icon />
                  <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
});