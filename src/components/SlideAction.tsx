import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideActionProps {
  onComplete: () => void;
  label?: string;
  price?: string;
  className?: string;
}

export const SlideAction = ({ onComplete, label = "Slide to confirm", price = "Rs 1,800", className }: SlideActionProps) => {
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [slideDistance, setSlideDistance] = useState(250);

  useEffect(() => {
    if (containerRef.current && handleRef.current) {
      setSlideDistance(containerRef.current.clientWidth - handleRef.current.clientWidth - 16);
    }
  }, []);

  // Text fades out as drag approaches completion threshold
  const textOpacity = useTransform(x, [0, slideDistance * 0.75], [1, 0]);
  const glowOpacity = useTransform(x, [0, slideDistance], [0, 1]);
  const handleScale = useTransform(x, [0, slideDistance], [1, 0.95]);

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX >= slideDistance * 0.85) {
      animate(x, slideDistance, { type: "spring", stiffness: 300, damping: 25 });
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2500); // 2.5 seconds to display checkmark sequence before navigating
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  };

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      <div 
        ref={containerRef}
        className="relative h-16 w-full rounded-[30px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl flex items-center p-2"
      >
        {/* Animated Background Glow */}
        <motion.div 
          style={{ opacity: glowOpacity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-amber-500/20 pointer-events-none"
        />

        {/* Shimmering Track Label */}
        <motion.div 
          style={{ opacity: textOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
            {label} <span className="text-amber-500">{price}</span>
          </span>
        </motion.div>

        {/* Swipe Handle */}
        <motion.div
          ref={handleRef}
          drag="x"
          dragConstraints={{ left: 0, right: slideDistance }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          style={{ x, scale: handleScale }}
          className="relative z-40 h-12 w-12 rounded-[22px] bg-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
        >
          <div className="flex items-center gap-0.5">
            {[1, 0.6, 0.2].map((op, i) => (
              <motion.div 
                key={i}
                animate={{ x: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="h-1 w-1 rounded-full bg-black"
                style={{ opacity: op }}
              />
            ))}
          </div>
        </motion.div>

        {/* Dynamic Edge Glow */}
        <motion.div 
          style={{ opacity: glowOpacity }}
          className="absolute inset-0 rounded-[30px] border border-amber-500/30 pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        />
      </div>

      {/* Complete Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-2xl px-8"
          >
            {/* Centered Checkmark Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="h-24 w-24 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.25)]"
            >
              <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M20 6L9 17L4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                  onAnimationComplete={() => {
                    if (navigator.vibrate) {
                      navigator.vibrate([40, 30, 80]);
                    }
                  }}
                />
              </svg>
            </motion.div>

            {/* Success Text */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.45 }}
              className="text-center"
            >
              <p className="text-xl font-bold tracking-tight text-white mb-2">Booking Confirmed</p>
              <p className="text-sm text-white/45 font-medium">Your booking is recorded successfully</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
