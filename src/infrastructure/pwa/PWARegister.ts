export interface PWALifecycleCallbacks {
  readonly onUpdateFound: (reloadFn: () => void) => void;
  readonly onOfflineReady: () => void;
}

export class PWARegister {
  static register(callbacks?: PWALifecycleCallbacks): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', async () => {
      try {
        const existingReg = await navigator.serviceWorker.getRegistration();
        const registration = existingReg || await navigator.serviceWorker.register('/sw.js');

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available, send SKIP_WAITING to trigger controllerchange
                const reloadFn = () => installingWorker.postMessage({ type: 'SKIP_WAITING' });
                if (callbacks) callbacks.onUpdateFound(reloadFn);
              } else {
                if (callbacks) callbacks.onOfflineReady();
              }
            }
          });
        };
      } catch (error) {
        // Production safety bounds
      }
    });
  }
}
