import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Monitor, Share, PlusSquare, CheckCircle2, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isAppStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if device is iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user dismissed previously
    const dismissedTime = localStorage.getItem('ezy_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 3 * 24 * 60 * 60 * 1000) {
      // Dismissed within last 3 days
      return;
    }

    // Handle Chrome/Android/Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show iOS banner after 3 seconds
    if (isIOSDevice && !isAppStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback if browser doesn't trigger prompt directly
      alert('To install ezy.homes app:\n- On Android/Chrome: Tap menu (⋮) -> "Add to Home screen"\n- On Desktop Chrome: Click the install icon in address bar');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalledSuccess(true);
      setShowPrompt(false);
      setTimeout(() => setInstalledSuccess(false), 5000);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ezy_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom App Bar / Prompt Banner */}
      {showPrompt && !installedSuccess && (
        <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[999] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img src="/favicon.svg" alt="ezy.homes icon" className="w-10 h-10 rounded-lg object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white tracking-tight">Install ezy.homes App</h4>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold text-[9px] uppercase">
                    Zero Fees
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-tight mt-0.5">
                  Fast 1-click access for Android, iPhone & Desktop.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installed Success Toast */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-[999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>ezy.homes app successfully installed on your device!</span>
        </div>
      )}

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl p-5 border border-slate-700 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 p-1 flex items-center justify-center shadow-lg">
                <img src="/favicon.svg" alt="App Icon" className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Install on iPhone / iPad</h3>
                <p className="text-xs text-rose-400 font-semibold">ezy.homes iOS Progressive App</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-gray-200">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold shrink-0">1</div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1">
                    Tap Share Button <Share className="w-3.5 h-3.5 text-rose-400 inline" />
                  </p>
                  <p className="text-[11px] text-gray-400">At the bottom of your Safari browser bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold shrink-0">2</div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1">
                    Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-rose-400 inline" />
                  </p>
                  <p className="text-[11px] text-gray-400">Scroll down in the Safari share menu.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold shrink-0">3</div>
                <div>
                  <p className="font-bold text-white">Tap "Add"</p>
                  <p className="text-[11px] text-gray-400">ezy.homes will appear as a full-screen app icon.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
