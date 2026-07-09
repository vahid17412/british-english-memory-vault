import { useState, useEffect, useCallback } from 'react';
import { PWARegister } from '@/infrastructure/pwa/PWARegister';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  readonly userChoice: Promise<{ readonly outcome: 'accepted' | 'dismissed' }>;
  readonly prompt: () => Promise<void>;
}

export function usePWAStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showUpdateAlert, setShowUpdateAlert] = useState<boolean>(false);
  const [reloadAppFn, setReloadAppFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    PWARegister.register({
      onUpdateFound: (reloadFn) => {
        setReloadAppFn(() => reloadFn);
        setShowUpdateAlert(true);
      },
      onOfflineReady: () => {}
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isOnline,
    isInstallable: deferredPrompt !== null,
    showUpdateAlert,
    triggerNativeInstall,
    setShowUpdateAlert,
    reloadAppFn
  };
}