import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppUpdatePrompt: React.FC = () => {
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('✅ Service Worker registrato:', swUrl);
      // Check for updates every 60 seconds
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ Errore registrazione SW:', error);
    },
    onOfflineReady() {
      console.log('✅ App pronta per uso offline');
      setShowOfflineReady(true);
      setTimeout(() => setShowOfflineReady(false), 4000);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  if (needRefresh) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 md:left-auto md:right-6 md:w-auto md:max-w-sm">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground shadow-lg">
          <RefreshCw className="h-5 w-5 shrink-0 animate-spin" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Aggiornamento disponibile</p>
            <p className="text-xs opacity-80">Clicca per aggiornare l'app</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleUpdate}
              size="sm"
              variant="secondary"
              className="h-8 px-3 text-xs font-medium"
            >
              Aggiorna
            </Button>
            <Button
              onClick={dismissUpdate}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showOfflineReady) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 md:left-auto md:right-6 md:w-auto md:max-w-sm">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success text-success-foreground shadow-lg">
          <Wifi className="h-5 w-5 shrink-0" />
          <p className="font-medium text-sm">App pronta per uso offline</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AppUpdatePrompt;
