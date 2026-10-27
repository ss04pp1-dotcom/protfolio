"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Preloader — animated percentage counter with staggered name reveal,
 * then exits with a slide-up curtain. Shows once per session load.
 */
export function Preloader({ name, onDone }: { name: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let value = 0;
    const timer = setInterval(() => {
      // ease toward 100
      value += Math.max(1.2, (100 - value) * 0.06);
      if (value >= 100) {
        value = 100;
        clearInterval(timer);
        setTimeout(() => setExiting(true), 260);
        setTimeout(onDone, 950);
      }
      setProgress(Math.floor(value));
    }, 28);
    return () => clearInterval(timer);
  }, [onDone]);

  const letters = name.split("");

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0a0812]"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* ambient glow */}
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-primary)] opacity-[0.14] blur-[110px]" />
          <div className="absolute left-1/3 top-1/3 h-56 w-56 rounded-full bg-[var(--site-accent)] opacity-[0.1] blur-[100px]" />

          <div className="relative flex items-center gap-1 overflow-hidden">
            {letters.map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                initial={{ y: 64, opacity: 0, rotateX: -80 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.045, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 font-mono text-xs uppercase tracking-[0.35em] text-white/40"
          >
            Portfolio Loading
          </motion.div>

          {/* progress bar + number */}
          <div className="relative mt-10 w-56 md:w-72">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-white/50">
              <span className="animate-twinkle">✦</span>
              <span className="text-gradient text-base font-semibold tabular-nums">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
