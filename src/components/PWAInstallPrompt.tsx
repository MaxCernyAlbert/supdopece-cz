'use client';

import { useState, useEffect } from 'react';
import { config } from '@/data/config';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const daysSinceDismissed = dismissedDate
      ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    // Show prompt if:
    // - Not already installed
    // - Not dismissed, or dismissed more than 7 days ago
    // - Is iOS or has install event
    if (!isInStandaloneMode && daysSinceDismissed > 7) {
      if (iOS) {
        // Show iOS install instructions after 3 seconds
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      if (daysSinceDismissed > 7) {
        // Show prompt after 3 seconds
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if dismissed
  if (!showPrompt) return null;

  // iOS install instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-primary-500">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📱</span>
            <div className="flex-grow">
              <h3 className="font-bold text-bread-dark mb-2">
                Nainstalovat {config.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Přidejte si aplikaci na plochu pro rychlejší přístup:
              </p>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside mb-3">
                <li>Klepněte na tlačítko Sdílet
                  <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </li>
                <li>Vyberte "Přidat na plochu"</li>
                <li>Klepněte na "Přidat"</li>
              </ol>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Zavřít
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome install prompt
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-primary-500">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📱</span>
            <div className="flex-grow">
              <h3 className="font-bold text-bread-dark mb-2">
                Nainstalovat aplikaci
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Získejte rychlejší přístup a lepší zážitek!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Nainstalovat
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Možná později
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
