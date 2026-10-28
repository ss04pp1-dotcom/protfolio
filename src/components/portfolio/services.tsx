"use client";

import type { Service } from "@/lib/types";
import { DynIcon } from "@/components/icon";
import { SectionHeading, Accent } from "./section-heading";
import { StaggerGroup, StaggerItem } from "./reveal";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <SectionHeading
        eyebrow="What I Offer"
        title={
          <>
            Services Crafted <Accent>For You</Accent>
          </>
        }
        description="Move your cursor across the cards — the light follows you and the frame ignites. That's the level of polish I bring to every project."
        index={6}
      />

      <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4" stagger={0.11}>
        {services.map((service, i) => (
          <StaggerItem key={service.id} className="h-full">
            <article
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                el.style.setProperty("--my", `${e.clientY - rect.top}px`);
              }}
              data-cursor
              className="conic-hover glass spotlight-card group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_22px_60px_-22px_rgba(139,92,246,0.55)]"
            >
              {/* index number */}
              <span className="absolute right-5 top-4 font-display text-5xl font-black text-white/[0.05] transition-all duration-500 group-hover:text-white/[0.09]">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="animate-float-soft [animation-delay:calc(var(--i)*-1.1s)]" style={{ ["--i" as string]: i }}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white shadow-[0_12px_32px_-10px_rgba(139,92,246,0.65)] transition-transform duration-400 group-hover:rotate-[-8deg] group-hover:scale-110">
                  <DynIcon name={service.icon} className="h-7 w-7" />
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{service.description}</p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--site-accent)] opacity-0 transition-all duration-400 group-hover:opacity-100">
                Let&apos;s build it
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
