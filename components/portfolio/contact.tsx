"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { SectionHeading, Accent } from "./section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { useToast } from "@/hooks/use-toast";

export function Contact({ settings }: { settings: SiteSettings }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", content: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus("sent");
      toast({ title: "Message sent!", description: "Thanks for reaching out — I'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", content: "" });
      setTimeout(() => setStatus("idle"), 2600);
    } catch (err) {
      setStatus("idle");
      toast({
        title: "Couldn't send message",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  }

  const infoCards = [
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: Phone, label: "Phone", value: settings.phone, href: settings.phone ? `tel:${settings.phone.replace(/\s/g, "")}` : undefined },
    { icon: MapPin, label: "Location", value: settings.location },
    { icon: Clock, label: "Availability", value: settings.availability },
  ].filter((c) => c.value);

  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div aria-hidden className="absolute right-1/4 top-16 h-72 w-72 rounded-full bg-[var(--site-accent)] opacity-[0.06] blur-[110px]" />

      <SectionHeading
        eyebrow="Say Hello"
        title={
          <>
            Let&apos;s Work <Accent>Together</Accent>
          </>
        }
        description="Have a project in mind? Drop a message — it lands straight in my admin inbox."
        index={8}
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* info cards */}
        <StaggerGroup className="flex flex-col gap-5" stagger={0.1}>
          {infoCards.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)]/25 to-[var(--site-accent)]/25 text-[var(--site-accent)] transition-all duration-300 group-hover:scale-110 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
                  <div className="truncate text-[15px] font-medium text-white/85">{value}</div>
                </div>
              </>
            );
            return (
              <StaggerItem key={label}>
                {href ? (
                  <a
                    href={href}
                    data-cursor
                    className="glass group flex w-full items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/45 hover:shadow-[0_16px_44px_-18px_rgba(139,92,246,0.5)]"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="glass group flex w-full items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-primary)]/45">
                    {inner}
                  </div>
                )}
              </StaggerItem>
            );
          })}
          <StaggerItem>
            <div className="glass relative overflow-hidden rounded-2xl p-6">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--site-primary)] opacity-20 blur-2xl" />
              <p className="font-display text-lg font-semibold text-white">Currently {settings.availability.toLowerCase()}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Typical response time is under 24 hours. For urgent inquiries, mention it in the subject line.
              </p>
            </div>
          </StaggerItem>
        </StaggerGroup>

        {/* form */}
        <Reveal x={0} y={30} delay={0.15}>
          <form onSubmit={handleSubmit} className="glass relative overflow-hidden rounded-3xl p-7 sm:p-9">
            <div aria-hidden className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[var(--site-accent)] opacity-[0.13] blur-3xl" />

            <div className="grid gap-6 sm:grid-cols-2">
              <FloatingField
                id="cf-name"
                label="Your Name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <FloatingField
                id="cf-email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
              />
            </div>
            <div className="mt-6">
              <FloatingField
                id="cf-subject"
                label="Subject (optional)"
                value={form.subject}
                onChange={(v) => setForm((f) => ({ ...f, subject: v }))}
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <textarea
                  id="cf-message"
                  required
                  rows={5}
                  placeholder=" "
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="peer w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 pb-3.5 pt-7 text-[15px] text-white outline-none transition-all duration-300 placeholder-transparent focus:border-[var(--site-primary)]/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
                />
                <label
                  htmlFor="cf-message"
                  className="pointer-events-none absolute left-5 top-5 text-sm text-white/40 transition-all duration-250 peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-[var(--site-accent)] peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Your Message
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={status === "sending"}
              whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: status === "idle" ? 0.97 : 1 }}
              data-cursor
              className={`group relative mt-8 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 font-semibold text-white transition-all duration-300 sm:w-auto ${
                status === "sent"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_10px_36px_-10px_rgba(16,185,129,0.7)]"
                  : "bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_10px_36px_-10px_rgba(139,92,246,0.7)] hover:shadow-[0_14px_48px_-8px_rgba(217,70,239,0.55)]"
              }`}
            >
              {status === "idle" && (
                <>
                  <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  Send Message
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                </>
              )}
              {status === "sending" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              )}
              {status === "sent" && (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Message Sent!
                </>
              )}
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 pb-3.5 pt-7 text-[15px] text-white outline-none transition-all duration-300 placeholder-transparent focus:border-[var(--site-primary)]/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-5 top-5 text-sm text-white/40 transition-all duration-250 peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-[var(--site-accent)] peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
