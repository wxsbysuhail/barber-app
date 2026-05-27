import { useLocation } from "react-router-dom";
import { TabBar } from "./TabBar";
import { Sidebar } from "./Sidebar";
import { IntelligenceCenter } from "./IntelligenceCenter";
import { useUI } from "@/lib/ui-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useState, useEffect } from "react";
import { X, Share } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { isIntelligenceOpen, setIntelligenceOpen } = useUI();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showiOSGuide, setShowiOSGuide] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const hasDismissed = localStorage.getItem("koupé-install-dismissed") === "true";

    if (!isStandalone && !hasDismissed) {
      setShowInstallBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !hasDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    haptics.medium();
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isiOS) {
      setShowiOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        toast.success("Koupé successfully installed!");
      }
    } else {
      setShowiOSGuide(true);
    }
  };

  const handleLater = () => {
    haptics.light();
    localStorage.setItem("koupé-install-dismissed", "true");
    setShowInstallBanner(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-obsidian overflow-hidden">
      
      {/* Live Briefings Pill — archived */}
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 relative z-0">
        <div className={cn("w-full h-full min-h-screen", isMobile && "pb-48")}>
          {children}
        </div>

        <IntelligenceCenter 
          isOpen={isIntelligenceOpen} 
          onClose={() => setIntelligenceOpen(false)} 
        />
      </main>

      {/* ── Custom Floating PWA Install Banner ── */}
      <AnimatePresence>
        {isMobile && showInstallBanner && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-28 inset-x-0 z-[110] px-4 pointer-events-none"
          >
            <div className="pointer-events-auto mx-auto max-w-md bg-[#0a0b0d]/95 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <Logo iconOnly className="scale-90" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Install Koupé App</h4>
                  <p className="text-[10px] text-white/35 leading-tight mt-0.5">Instant booking & offline access</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLater}
                  className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white"
                >
                  Later
                </button>
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white/95"
                >
                  Install
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS PWA Install Guide Bottom Sheet */}
      <AnimatePresence>
        {showiOSGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowiOSGuide(false)}
              className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[300] max-h-[85vh] rounded-t-[32px] border-t border-white/10 bg-obsidian p-6 pb-12 shadow-2xl flex flex-col gap-6 pointer-events-auto"
            >
              <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">Add to Home Screen</h3>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-1">iOS Safari Installation Guide</p>
                </div>
                <button 
                  onClick={() => setShowiOSGuide(false)}
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 py-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">Open Safari Share Menu</h4>
                    <p className="text-xs text-white/35 mt-1">Tap the Share button <Share className="inline h-3.5 w-3.5 mx-1 text-sky-400" /> at the bottom or top of your Safari browser bar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">Add to Home Screen</h4>
                    <p className="text-xs text-white/35 mt-1">Scroll down the share sheet options and tap <strong>'Add to Home Screen'</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-platinum/80 shrink-0 font-bold text-xs">3</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">Launch Standalone App</h4>
                    <p className="text-xs text-white/35 mt-1">A Koupé app icon will appear on your home screen. Tap it to launch full-screen.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowiOSGuide(false);
                  localStorage.setItem("koupé-install-dismissed", "true");
                  setShowInstallBanner(false);
                }}
                className="press w-full h-14 rounded-2xl bg-white text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center"
              >
                Acknowledge
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isMobile && <TabBar onIntelligenceTrigger={() => setIntelligenceOpen(true)} />}
    </div>
  );
};
