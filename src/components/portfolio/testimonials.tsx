"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { SectionHeading, Accent } from "./section-heading";
import { Reveal } from "./reveal";
import { Tilt } from "./tilt";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync initial carousel index
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // autoplay
  useEffect(() => {
    if (!emblaApi || hovered || testimonials.length < 2) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 4800);
    return () => clearInterval(timer);
  }, [emblaApi, hovered, testimonials.length]);

  return (
    <section id="testimonials" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div aria-hidden className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-[var(--site-primary)] opacity-[0.06] blur-[120px]" />

      <SectionHeading
        eyebrow="Kind Words"
        title={
          <>
            What Clients <Accent>Say</Accent>
          </>
        }
        description="Real feedback from real collaborations — the carousel keeps rolling, just like my work ethic."
        index={7}
      />

      <Reveal className="mt-16" delay={0.1}>
        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div ref={emblaRef} className="overflow-hidden" data-cursor>
            <div className="-ml-6 flex touch-pan-y">
              {testimonials.map((t) => (
                <div key={t.id} className="min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 xl:basis-1/3">
                  <Tilt max={7} className="group h-full">
                  <motion.figure
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="glass group relative flex h-full flex-col rounded-3xl p-7 transition-colors duration-300 hover:border-[var(--site-accent)]/40"
                  >
                    <Quote aria-hidden className="h-9 w-9 rotate-180 text-[var(--site-primary)]/50 transition-colors duration-300 group-hover:text-[var(--site-primary)]" />
                    <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/65">
                      &ldquo;{t.content}&rdquo;
                    </blockquote>

                    <div className="mt-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 300, damping: 16 }}
                        >
                          <Star
                            className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-white/15"}`}
                          />
                        </motion.span>
                      ))}
                    </div>

                    <figcaption className="mt-6 flex items-center gap-4 border-t border-white/[0.07] pt-6">
                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--site-primary)]/40 bg-gradient-to-br from-[var(--site-primary)]/25 to-[var(--site-accent)]/25 font-display text-sm font-bold text-white">
                        {t.avatarUrl ? (
                          <img
                            src={t.avatarUrl}
                            alt={t.name}
                            className="h-full w-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        ) : (
                          t.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                        )}
                        <span className="absolute -bottom-px left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]" />
                      </span>
                      <div>
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-xs text-white/45">
                          {t.role}
                          {t.company ? ` · ${t.company}` : ""}
                        </div>
                      </div>
                    </figcaption>
                  </motion.figure>
                  </Tilt>
                </div>
              ))}
            </div>
          </div>

          {/* arrows */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <CarouselBtn onClick={() => emblaApi?.scrollPrev()} label="Previous testimonial">
              <ChevronLeft className="h-4.5 w-4.5" />
            </CarouselBtn>
            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === selectedIdx ? "w-7 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)]" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <CarouselBtn onClick={() => emblaApi?.scrollNext()} label="Next testimonial">
              <ChevronRight className="h-4.5 w-4.5" />
            </CarouselBtn>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function CarouselBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      data-cursor
      className="glass flex h-11 w-11 items-center justify-center rounded-full text-white/75 transition-colors duration-300 hover:border-[var(--site-primary)]/50 hover:text-white"
    >
      {children}
    </motion.button>
  );
}
