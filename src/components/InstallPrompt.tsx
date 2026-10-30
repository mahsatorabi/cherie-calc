import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt({ accentClass = 'text-pink-600' }: { accentClass?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('cherie_install_dismissed') === '1';
    } catch {
      return false;
    }
  });
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (isStandalone || dismissed || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === 'dismissed') {
      setDismissed(true);
      try {
        sessionStorage.setItem('cherie_install_dismissed', '1');
      } catch {
        // ignore
      }
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('cherie_install_dismissed', '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-pink-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_30px_-10px_rgba(244,114,182,0.45)] backdrop-blur">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 ${accentClass}`}>
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-rose-900">Install Chérie Calc</p>
          <p className="truncate text-xs text-rose-400">Add to your home screen</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1 text-rose-300 hover:bg-rose-50 hover:text-rose-500"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
