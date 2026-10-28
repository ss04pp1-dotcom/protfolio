"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen, Mail, Trash2, Loader2, Inbox, ChevronDown, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/lib/types";

/**
 * MessagesManager — inbox for contact form submissions with
 * unread states, expand-to-read and delete.
 */
export function MessagesManager({ onChanged }: { onChanged?: () => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/crud/messages", { cache: "no-store" });
      if (!res.ok) throw new Error();
      // newest first for the inbox
      const list = (await res.json()) as Message[];
      setMessages([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    } catch {
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(msg: Message, read: boolean) {
    setMessages((ms) => ms.map((m) => (m.id === msg.id ? { ...m, read } : m)));
    await fetch(`/api/crud/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    }).catch(() => {});
    onChanged?.();
  }

  async function remove(msg: Message) {
    try {
      const res = await fetch(`/api/crud/messages/${msg.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessages((ms) => ms.filter((m) => m.id !== msg.id));
      toast({ title: "Message deleted" });
      onChanged?.();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-3 font-display text-xl font-bold text-white">
            Messages
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="rounded-full bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-accent)] px-2.5 py-0.5 text-xs font-bold text-white"
              >
                {unread} new
              </motion.span>
            )}
          </h3>
          <p className="mt-1 text-sm text-white/45">Every contact form submission lands here.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] py-14 text-white/40">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading inbox…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-14 text-white/35">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">Inbox zero — nothing yet. Share your portfolio!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isOpen = expanded === msg.id;
              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60, height: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    msg.read ? "border-white/[0.07] bg-white/[0.02]" : "border-[var(--site-primary)]/30 bg-[var(--site-primary)]/[0.06]"
                  }`}
                >
                  <button
                    onClick={() => {
                      const next = isOpen ? null : msg.id;
                      setExpanded(next);
                      if (next && !msg.read) markRead(msg, true);
                    }}
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/[0.03]"
                    data-cursor
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        msg.read ? "bg-white/[0.06] text-white/40" : "bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-accent)] text-white"
                      }`}
                    >
                      {msg.read ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className={`truncate text-sm font-semibold ${msg.read ? "text-white/70" : "text-white"}`}>{msg.name}</span>
                        <span className="truncate text-xs text-white/40">{msg.email}</span>
                        {!msg.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--site-accent)]" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-white/40">
                        {msg.subject || "(no subject)"} · {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-white/35 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
                      >
                        <div className="border-t border-white/[0.07] px-5 py-4">
                          <p className="text-sm leading-relaxed text-white/70">{msg.content}</p>
                          <div className="mt-4 flex gap-2.5">
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Your message")}`}
                              className="flex items-center gap-2 rounded-lg bg-[var(--site-primary)]/15 px-3.5 py-2 text-xs font-semibold text-[var(--site-accent)] transition-colors hover:bg-[var(--site-primary)]/25"
                            >
                              <Reply className="h-3.5 w-3.5" /> Reply by email
                            </a>
                            {!msg.read && (
                              <button
                                onClick={() => markRead(msg, true)}
                                className="rounded-lg bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => remove(msg)}
                              className="ml-auto flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
