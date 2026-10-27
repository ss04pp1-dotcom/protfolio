"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, User, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * AccountManager — change admin username & password (requires current password).
 */
export function AccountManager({ username, onUsernameChanged }: { username: string; onUsernameChanged: (u: string) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ username, currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (form.newPassword && form.newPassword !== form.confirm) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must be identical.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast({ title: "Account updated!", description: "Use your new credentials next time you log in." });
      onUsernameChanged(data.username || form.username);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirm: "" }));
    } catch (err) {
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "border-white/10 bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[var(--site-primary)]/60 focus-visible:ring-[var(--site-primary)]/30";

  return (
    <form onSubmit={save} className="max-w-xl">
      <h3 className="font-display text-xl font-bold text-white">Account & Security</h3>
      <p className="mt-1 text-sm text-white/45">Keep your dashboard locked — update your login credentials.</p>

      <div className="mt-8 space-y-5">
        <div>
          <Label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
            <User className="h-3.5 w-3.5" /> Username
          </Label>
          <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <Label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
            <ShieldCheck className="h-3.5 w-3.5" /> Current Password <span className="text-rose-400">*</span>
          </Label>
          <Input
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Required to confirm changes"
            className={inputCls}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
              <KeyRound className="h-3.5 w-3.5" /> New Password
            </Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Leave blank to keep"
              className={inputCls}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">Confirm New Password</Label>
            <Input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat new password"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={saving}
        data-cursor
        className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_26px_-8px_rgba(139,92,246,0.7)] disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {saving ? "Updating…" : "Update Account"}
      </motion.button>
    </form>
  );
}
