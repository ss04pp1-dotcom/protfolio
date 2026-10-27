"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, X, GripVertical, Inbox } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DynIcon, ICON_NAMES } from "@/components/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageField } from "./image-field";
import { useToast } from "@/hooks/use-toast";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "image" | "icon" | "rating" | "url";
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2;
  hint?: string;
}

type Item = Record<string, unknown> & { id: string };

/**
 * CrudShell — animated generic list manager: create / edit / delete /
 * reorder rows with a dialog form generated from field definitions.
 */
export function CrudShell({
  entity,
  title,
  description,
  fields,
  defaults,
  titleKey,
  subtitleKeys = [],
  mediaKey,
  onChanged,
}: {
  entity: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  titleKey: string;
  subtitleKeys?: string[];
  mediaKey?: string;
  onChanged?: () => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Item | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/crud/${entity}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setItems((await res.json()) as Item[]);
    } catch {
      toast({ title: "Failed to load", description: "Could not fetch items.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [entity, toast]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  function openCreate() {
    setForm({ ...defaults });
    setCreating(true);
  }

  function openEdit(item: Item) {
    const data: Record<string, unknown> = {};
    fields.forEach((f) => (data[f.name] = item[f.name] ?? ""));
    setForm(data);
    setEditing(item);
  }

  function closeDialog() {
    setCreating(false);
    setEditing(null);
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const isEdit = Boolean(editing);
      const res = await fetch(isEdit ? `/api/crud/${entity}/${editing!.id}` : `/api/crud/${entity}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: isEdit ? "Updated!" : "Created!", description: `${title} saved & site refreshed.` });
      closeDialog();
      await load();
      onChanged?.();
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item) {
    try {
      const res = await fetch(`/api/crud/${entity}/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Deleted", description: "Item removed from the site." });
      await load();
      onChanged?.();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  async function move(item: Item, dir: "up" | "down") {
    try {
      const res = await fetch(`/api/crud/${entity}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ move: dir }),
      });
      if (!res.ok) throw new Error();
      await load();
      onChanged?.();
    } catch {
      toast({ title: "Reorder failed", variant: "destructive" });
    }
  }

  const dialogOpen = creating || editing !== null;

  return (
    <div>
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          {description && <p className="mt-1 text-sm text-white/45">{description}</p>}
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreate}
          data-cursor
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-4.5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_26px_-8px_rgba(139,92,246,0.7)]"
        >
          <Plus className="h-4 w-4" /> Add New
        </motion.button>
      </div>

      {/* list */}
      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] py-14 text-white/40">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading items…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-14 text-white/35">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">Nothing here yet — add your first item.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-300 hover:border-[var(--site-primary)]/40 hover:bg-white/[0.05]"
              >
                {/* media / icon */}
                {mediaKey ? (
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1b1530] to-[#0f0b18]">
                    {String(item[mediaKey] || "") ? (
                      <img
                        src={String(item[mediaKey])}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-white/25">
                        {String(item[titleKey] || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                ) : item.icon ? (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--site-primary)]/25 to-[var(--site-accent)]/25 text-[var(--site-accent)]">
                    <DynIcon name={String(item.icon)} className="h-5 w-5" />
                  </span>
                ) : null}

                {/* text */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-white">{String(item[titleKey] || "Untitled")}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/40">
                    {subtitleKeys.map((k) =>
                      item[k] !== undefined && item[k] !== "" && item[k] !== false ? (
                        <span key={k}>
                          {item[k] === true ? "• active" : String(item[k]).slice(0, 42)}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>

                {/* actions */}
                <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="mr-1 hidden flex-col sm:flex">
                    <button onClick={() => move(item, "up")} disabled={i === 0} aria-label="Move up" className="rounded-md p-0.5 text-white/50 hover:text-white disabled:opacity-20">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(item, "down")} disabled={i === items.length - 1} aria-label="Move down" className="rounded-md p-0.5 text-white/50 hover:text-white disabled:opacity-20">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <GripVertical aria-hidden className="hidden h-4 w-4 text-white/15 sm:block" />
                  <button
                    onClick={() => openEdit(item)}
                    aria-label="Edit"
                    data-cursor
                    className="rounded-lg p-2.5 text-white/55 transition-all duration-300 hover:bg-[var(--site-primary)]/15 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(item)}
                    aria-label="Delete"
                    className="rounded-lg p-2.5 text-white/55 transition-all duration-300 hover:bg-rose-500/15 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* create/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-[#14101f] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-white">
              {editing ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Changes go live on the portfolio instantly after saving.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.span === 2 || f.type !== "text" ? "sm:col-span-2" : ""}>
                {f.type === "boolean" ? (
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <Label htmlFor={`f-${f.name}`} className="text-sm text-white/75">
                      {f.label}
                    </Label>
                    <Switch
                      id={`f-${f.name}`}
                      checked={Boolean(form[f.name])}
                      onCheckedChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
                    />
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`f-${f.name}`} className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
                      {f.label}
                      {f.required && <span className="text-rose-400">*</span>}
                    </Label>
                    {f.type === "text" && (
                      <Input
                        id={`f-${f.name}`}
                        value={String(form[f.name] ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60"
                      />
                    )}
                    {f.type === "url" && (
                      <Input
                        id={`f-${f.name}`}
                        type="url"
                        value={String(form[f.name] ?? "")}
                        placeholder={f.placeholder || "https://"}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60"
                      />
                    )}
                    {f.type === "number" && (
                      <Input
                        id={`f-${f.name}`}
                        type="number"
                        value={String(form[f.name] ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60"
                      />
                    )}
                    {f.type === "textarea" && (
                      <Textarea
                        id={`f-${f.name}`}
                        rows={4}
                        value={String(form[f.name] ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        className="resize-none border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60"
                      />
                    )}
                    {f.type === "image" && (
                      <ImageField id={`f-${f.name}`} value={String(form[f.name] ?? "")} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
                    )}
                    {f.type === "icon" && (
                      <div className="space-y-2">
                        <Select value={String(form[f.name] || "Sparkles")} onValueChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}>
                          <SelectTrigger className="w-full border-white/10 bg-white/[0.05] text-white">
                            <span className="flex items-center gap-2">
                              <DynIcon name={String(form[f.name] || "Sparkles")} className="h-4 w-4 text-[var(--site-accent)]" />
                              <SelectValue />
                            </span>
                          </SelectTrigger>
                          <SelectContent className="max-h-72 border-white/10 bg-[#14101f] text-white">
                            {ICON_NAMES.map((n) => (
                              <SelectItem key={n} value={n} className="text-white/80 focus:bg-white/10 focus:text-white">
                                <span className="flex items-center gap-2">
                                  <DynIcon name={n} className="h-4 w-4" /> {n}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form[f.name] && (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs text-white/60">
                            <DynIcon name={String(form[f.name])} className="h-4 w-4 text-[var(--site-accent)]" />
                            {String(form[f.name])}
                          </span>
                        )}
                      </div>
                    )}
                    {f.type === "rating" && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">{Number(form[f.name] ?? 5)} / 5</span>
                        </div>
                        <Slider
                          value={[Number(form[f.name] ?? 5)]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={([v]) => setForm((s) => ({ ...s, [f.name]: v }))}
                          className="mt-2"
                        />
                      </div>
                    )}
                    {f.hint && <p className="mt-1.5 text-[11px] text-white/30">{f.hint}</p>}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button onClick={closeDialog} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:text-white">
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={save}
              disabled={saving}
              data-cursor
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_26px_-8px_rgba(139,92,246,0.7)] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Create"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-white/10 bg-[#14101f]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this item?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              &ldquo;{deleting ? String(deleting[titleKey]) : ""}&rdquo; will be permanently removed from the site. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove(deleting)} className="bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
