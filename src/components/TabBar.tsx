import { Home, Calendar, Sparkles, User, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useIntelligence } from "@/lib/intelligence";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/book", icon: Calendar, label: "Book" },
  { to: "/style", icon: Sparkles, label: "AI Style" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/admin", icon: BarChart3, label: "Studio" },
];

export const TabBar = ({ onIntelligenceTrigger }: { onIntelligenceTrigger?: () => void }) => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 pointer-events-none mb-2">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="glass-refractive flex items-center justify-between gap-1 rounded-[40px] p-2 shadow-elev overflow-hidden relative z-10 border border-white/10">
          {tabs.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
            
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => haptics.light()}
                className="relative flex flex-1 items-center justify-center py-3 outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 z-10 bg-primary/20 rounded-[20px] border border-primary/20 mx-1 my-1 shadow-glow"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                
                <div className={cn(
                  "relative z-20 flex flex-col items-center gap-1 transition-colors duration-300 px-4",
                  isActive ? "text-primary" : "text-platinum/30"
                )}>
                  <Icon className={cn("h-5 w-5", isActive ? "scale-110" : "scale-100")} strokeWidth={isActive ? 2.5 : 1.5} />
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] font-black uppercase tracking-widest"
                    >
                      {label}
                    </motion.span>
                  )}
                </div>
                
                {/* Tap feedback overlay */}
                <motion.div 
                  whileTap={{ scale: 0.9, opacity: 0.4 }}
                  className="absolute inset-0 z-0 bg-white/5 rounded-[20px] opacity-0" 
                />
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
