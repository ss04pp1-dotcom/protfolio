"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ImageIcon, Link as LinkIcon, Check, RefreshCw } from "lucide-react";

/**
 * ImageField — high-fidelity image uploader & URL manager.
 * Supports auto-compression to high-res WebP/JPEG data URLs
 * for zero-dependency persistence across Cloudflare D1 & SQLite.
 */
export function ImageField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, 900, 0.85);
      setFailed(false);
      onChange(dataUrl);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const isDataUrl = value?.startsWith("data:");
  const hasValue = Boolean(value) && !failed;

  return (
    <div className="space-y-3">
      {hasValue ? (
        /* Image loaded state: clean card with preview, badges & clear actions */
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded portrait"
                onError={() => setFailed(true)}
                onLoad={() => setFailed(false)}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <Check className="h-3 w-3" />
                  {isDataUrl ? "Photo Uploaded" : "Linked Photo"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-white/50">
                {isDataUrl
                  ? `Optimized file (${Math.round((value.length * 3) / 4 / 1024)} KB)`
                  : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-white/80 transition-all hover:border-[var(--site-primary)]/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              {busy ? "Processing…" : "Replace"}
            </button>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setUrlDraft("");
                setShowUrlInput(false);
              }}
              aria-label="Remove image"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-rose-300/80 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty state: clear upload button & optional URL field */
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex flex-1 min-w-[140px] h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)]/20 to-[var(--site-accent)]/20 border border-[var(--site-primary)]/35 px-4 text-xs font-semibold text-white transition-all hover:border-[var(--site-primary)]/60 hover:from-[var(--site-primary)]/30 hover:to-[var(--site-accent)]/30 disabled:opacity-50"
            >
              <Upload className={`h-4 w-4 ${busy ? "animate-bounce" : ""}`} />
              {busy ? "Compressing & Uploading…" : "Upload Photo From Device"}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.07] hover:text-white"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {showUrlInput ? "Hide Link" : "Paste URL"}
            </button>
          </div>

          <AnimatePresence>
            {showUrlInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-1"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                    <input
                      id={id}
                      type="url"
                      value={urlDraft}
                      placeholder="https://example.com/avatar.jpg"
                      onChange={(e) => setUrlDraft(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-[var(--site-primary)]/60"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!urlDraft.trim()}
                    onClick={() => {
                      if (urlDraft.trim()) {
                        setFailed(false);
                        onChange(urlDraft.trim());
                      }
                    }}
                    className="h-9 rounded-xl bg-white/10 px-3.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function compressImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const isPng = file.type === "image/png";
      resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
