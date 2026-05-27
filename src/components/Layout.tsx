import { useLocation } from "react-router-dom";
import { TabBar } from "./TabBar";
import { Sidebar } from "./Sidebar";
import { IntelligenceCenter } from "./IntelligenceCenter";
import { useUI } from "@/lib/ui-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIntelligence } from "@/lib/intelligence";
import { haptics } from "@/lib/haptics";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { isIntelligenceOpen, setIntelligenceOpen } = useUI();
  const { unreadCount } = useIntelligence();
  const hideNav = pathname === "/checkout" || pathname === "/book" || pathname === "/style";

  if (hideNav) {
    return <main className="w-full min-h-screen relative">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-obsidian overflow-hidden">
      
      {/* ── Dynamic Island Pill (Mobile-First Top Center) ── */}
      <AnimatePresence>
        {isMobile && unreadCount > 0 && (
          <div className="fixed top-3 inset-x-0 z-[120] flex justify-center pointer-events-none px-6">
            <motion.button
              initial={{ y: -40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={() => { haptics.heavy(); setIntelligenceOpen(true); }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-white/10 bg-black/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl active:scale-95 transition-transform"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span className="text-[9px] font-black text-white uppercase tracking-[0.25em] whitespace-nowrap">
                {unreadCount} Live Briefing{unreadCount > 1 ? "s" : ""}
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 relative z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: isMobile ? 10 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? -10 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("w-full h-full min-h-screen", isMobile && "pb-48")}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <IntelligenceCenter 
          isOpen={isIntelligenceOpen} 
          onClose={() => setIntelligenceOpen(false)} 
        />
      </main>

      {isMobile && <TabBar onIntelligenceTrigger={() => setIntelligenceOpen(true)} />}
    </div>
  );
};
