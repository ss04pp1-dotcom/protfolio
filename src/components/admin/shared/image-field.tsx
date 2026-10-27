"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ImageIcon, ExternalLink } from "lucide-react";

/**
 * ImageField — paste an image URL or upload a file (auto-compressed
 * to a base64 data URL so it works anywhere, Cloudflare included).
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

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, 900, 0.85);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  const showPreview = value && !failed;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            id={id}
            value={value.startsWith("data:") ? "" : value}
            placeholder="https://example.com/image.jpg"
            onChange={(e) => {
              setFailed(false);
              onChange(e.target.value);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[var(--site-primary)]/60"
          />
          {value.startsWith("data:") && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              uploaded
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          data-cursor
          className="flex h-[42px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white/75 transition-all duration-300 hover:border-[var(--site-primary)]/50 hover:text-white disabled:opacity-50"
        >
          <Upload className={`h-4 w-4 ${busy ? "animate-bounce" : ""}`} />
          {busy ? "Processing…" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear image"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-rose-300/80 transition-all duration-300 hover:border-rose-500/40 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="group relative w-fit overflow-hidden rounded-xl border border-white/10">
              <img
                src={value}
                alt="Preview"
                onError={() => setFailed(true)}
                onLoad={() => setFailed(false)}
                className="h-28 w-44 object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white/80">preview</span>
                {value.startsWith("data:") ? null : (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="rounded-md bg-black/60 p-1 text-white/80" aria-label="Open image">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      // PNG with transparency stays PNG (small enough after resize), else JPEG
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
