"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, User, Lock, Loader2, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminLogin({
  onSuccess,
  onClose,
}: {
  onSuccess: (username: string) => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      toast({ title: `Welcome back, ${data.username}!`, description: "You now have full control of the site." });
      onSuccess(data.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      animate={error ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-strong relative overflow-hidden rounded-3xl p-8 shadow-2xl"
    >
      {/* decorative */}
      <div aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--site-primary)] opacity-20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[var(--site-accent)] opacity-[0.14] blur-3xl" />

      <button
        onClick={onClose}
        aria-label="Close admin panel"
        data-cursor
        className="glass absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all duration-300 hover:rotate-90 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative">
        <motion.div
          initial={{ scale: 0.5, rotate: -14, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 15 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] shadow-[0_14px_44px_-10px_rgba(139,92,246,0.8)]"
        >
          <ShieldCheck className="h-8 w-8 text-white" />
        </motion.div>

        <h2 className="mt-6 text-center font-display text-2xl font-bold text-white">Admin Access</h2>
        <p className="mt-2 text-center text-sm text-white/45">
          Sign in to command every pixel of this site
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[var(--site-primary)]/60 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.13)]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[var(--site-primary)]/60 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.13)]"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-center text-xs font-medium text-rose-300"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            data-cursor
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] py-3.5 font-semibold text-white shadow-[0_12px_40px_-12px_rgba(139,92,246,0.8)]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              <>
                <span className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                Enter Dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center font-mono text-[11px] leading-relaxed text-white/30">
          Default credentials: admin / admin123
          <br />
          (change them from Account settings after first login)
        </p>
      </div>
    </motion.div>
  );
}
