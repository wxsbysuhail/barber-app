import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Shield, Bell, Check } from "lucide-react";
import { useIntelligence } from "@/lib/intelligence";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface IntelligenceCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelligenceCenter = ({ isOpen, onClose }: IntelligenceCenterProps) => {
  const { notifications, markAsRead, markAllAsRead } = useIntelligence();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[250] bg-obsidian/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[300] w-full max-w-md bg-obsidian-elev/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* iOS Grabber */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20 z-10" />

            <div className="p-8 lg:p-12 pt-16 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Feed</div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Live Briefing</h2>
                </div>
                <button
                  onClick={onClose}
                  className="press h-12 w-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-platinum/40 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        haptics.light();
                        markAsRead(n.id);
                      }}
                      className={cn(
                        "press w-full text-left p-6 rounded-[32px] border transition-all flex gap-5",
                        n.read
                          ? "bg-white/[0.02] border-white/5 opacity-60"
                          : "bg-primary/[0.05] border-primary/20 shadow-glow-sm"
                      )}
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                          n.type === "warning"
                            ? "bg-rose-500/20 text-rose-500"
                            : n.type === "tactical"
                            ? "bg-primary/20 text-primary"
                            : "bg-platinum/10 text-platinum/40"
                        )}
                      >
                        {n.type === "warning" ? (
                          <Shield className="h-5 w-5" />
                        ) : (
                          <Zap className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">
                            {n.title}
                          </h4>
                          {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                        </div>
                        <p className="text-xs font-semibold text-platinum/40 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <div className="text-[8px] font-black uppercase tracking-widest text-white/10 pt-2">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <Bell className="h-12 w-12 mx-auto text-platinum/10" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-platinum/20">
                      Clear Channels. No Briefings.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 lg:p-12 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-white/5 bg-obsidian-elev/60 backdrop-blur-xl">
              <button
                onClick={() => {
                  haptics.heavy();
                  markAllAsRead();
                }}
                className="group press w-full h-16 rounded-[24px] bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2"
                disabled={notifications.every(n => n.read)}
              >
                <Check className="h-4 w-4" />
                Acknowledge All
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
