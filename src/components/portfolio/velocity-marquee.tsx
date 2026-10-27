"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";

/**
 * VelocityMarquee — an infinite strip whose speed *and direction* react to
 * how fast the visitor scrolls (Awwwards-style). Skews slightly with
 * velocity for a tactile, physical feel. Alternates solid / outlined items.
 */
export function VelocityMarquee({
  items,
  baseVelocity = 1.6,
  className,
  itemClassName,
  separator = "✦",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
  itemClassName?: string;
  separator?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 5], { clamp: true });
  const skew = useTransform(smoothVelocity, [-1500, 0, 1500], [-3, 0, 3], { clamp: true });

  const rowRef = useRef<HTMLDivElement>(null);
  const rowWidth = useRef(0);

  // measure one copy of the row so the wrap window stays accurate
  useEffect(() => {
    const measure = () => {
      rowWidth.current = rowRef.current?.offsetWidth ?? 0;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  const x = useTransform(baseX, (v) => {
    const half = Math.max(rowWidth.current / 2, 1);
    return `${wrap(-half, 0, v)}px`;
  });

  const direction = useRef(1);
  useAnimationFrame((_, delta) => {
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    // amplify base drift by scroll velocity — fast scroll = fast strip
    moveBy += direction.current * moveBy * Math.abs(vf) * 2.2;
    baseX.set(baseX.get() - moveBy);
  });

  if (items.length === 0) return null;

  const row = (ariaHidden: boolean) => (
    <div ref={ariaHidden ? rowRef : undefined} className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`flex items-center whitespace-nowrap ${itemClassName ?? ""}`}>
          <span className={i % 2 === 1 ? "text-outline-strong" : "text-white/85"}>{item}</span>
          <span className="text-gradient mx-6 text-base opacity-80 md:mx-9">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`mask-fade-x overflow-hidden ${className ?? ""}`} data-cursor>
      <motion.div style={{ x, skewX: skew }} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  );
}
