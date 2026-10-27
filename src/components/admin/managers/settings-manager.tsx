"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Palette, Sparkles, User, Contact, FileText, Sparkle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageField } from "../shared/image-field";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettings } from "@/lib/types";

/**
 * SettingsManager — edit every text, image and theme color of the site.
 * Saving pushes changes live to the public portfolio instantly.
 */
export function SettingsManager({
  settings,
  onChanged,
}: {
  settings: SiteSettings;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  function set<K extends keyof SiteSettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: "Settings saved!", description: "The live site has been updated." });
      onChanged();
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-white">Site Settings</h3>
          <p className="mt-1 text-sm text-white/45">Every word, image and color on the portfolio — all yours to command.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          data-cursor
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_26px_-8px_rgba(139,92,246,0.7)] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save & Go Live"}
        </motion.button>
      </div>

      <Tabs defaultValue="hero" className="mt-6">
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1.5">
          {[
            { v: "hero", label: "Hero", icon: Sparkles },
            { v: "about", label: "About", icon: User },
            { v: "contact", label: "Contact", icon: Contact },
            { v: "theme", label: "Theme", icon: Palette },
            { v: "extras", label: "Extras", icon: FileText },
          ].map(({ v, label, icon: Icon }) => (
            <TabsTrigger
              key={v}
              value={v}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--site-primary)] data-[state=active]:to-[var(--site-accent)] data-[state=active]:text-white rounded-xl px-4 py-2 text-xs font-semibold text-white/55 data-[state=active]:shadow-md"
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hero" className="mt-6 space-y-5">
          <Field label="Browser Tab Title" hint="Shown in the browser tab & search results">
            <Input value={form.siteTitle} onChange={(e) => set("siteTitle", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Your Name" hint="The huge animated hero name + preloader">
            <Input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Greeting" hint='Text above the name, e.g. "Hello, I&apos;m"'>
            <Input value={form.heroGreeting} onChange={(e) => set("heroGreeting", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Typewriter Roles" hint="Comma separated — they rotate in the hero">
            <Input value={form.heroRoles} onChange={(e) => set("heroRoles", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Hero Tagline">
            <Textarea rows={3} value={form.heroTagline} onChange={(e) => set("heroTagline", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Availability" hint="Shown in the pulsing chip + about badge">
            <Input value={form.availability} onChange={(e) => set("availability", e.target.value)} className={inputCls} />
          </Field>
        </TabsContent>

        <TabsContent value="about" className="mt-6 space-y-5">
          <Field label="About Section Title">
            <Input value={form.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} className={inputCls} />
          </Field>
          <Field label="About Text" hint="Write **word** to make it bold. Blank line = new paragraph.">
            <Textarea rows={9} value={form.aboutText} onChange={(e) => set("aboutText", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Your Photo" hint="Shown with the rotating gradient ring">
            <ImageField value={form.avatarUrl} onChange={(v) => set("avatarUrl", v)} />
          </Field>
          <Field label="Resume URL" hint="PDF link for the Download Resume button (optional)">
            <Input value={form.resumeUrl} onChange={(e) => set("resumeUrl", e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
          </Field>
        </TabsContent>

        <TabsContent value="theme" className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField label="Primary Color" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
            <ColorField label="Accent Color" value={form.accentColor} onChange={(v) => set("accentColor", v)} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
            style={{
              background: `linear-gradient(120deg, ${form.primaryColor}22, ${form.accentColor}18)`,
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <Sparkle className="h-4 w-4 text-[var(--site-accent)]" />
              Live preview after save — gradients, glows, buttons, bars & even the cursor recolor themselves.
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                style={{ background: `linear-gradient(90deg, ${form.primaryColor}, ${form.accentColor})` }}
              >
                Primary Button
              </span>
              <span
                className="rounded-full border px-5 py-2.5 text-sm font-semibold text-white/80"
                style={{ borderColor: `${form.primaryColor}66` }}
              >
                Outline Button
              </span>
              <span
                className="font-display text-2xl font-bold"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${form.primaryColor}, ${form.accentColor})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Gradient Text
              </span>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="extras" className="mt-6 space-y-5">
          <Field label="Marquee Text" hint="Comma separated words for the scrolling strip under About">
            <Textarea rows={2} value={form.marqueeText} onChange={(e) => set("marqueeText", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Footer Text">
            <Input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} className={inputCls} />
          </Field>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const inputCls =
  "border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60 focus-visible:ring-[var(--site-primary)]/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/15" data-cursor>
          <span className="absolute inset-0" style={{ background: value }} />
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#8b5cf6"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label} picker`}
          />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} font-mono`} />
      </div>
    </div>
  );
}
