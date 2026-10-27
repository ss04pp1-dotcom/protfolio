"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLogin } from "./admin-login";
import { AdminDashboard } from "./admin-dashboard";

/**
 * AdminGate — fullscreen overlay holding the login screen and,
 * once authenticated, the entire dashboard.
 */
export function AdminGate({
  open,
  onClose,
  siteData,
  refreshSite,
}: {
  open: boolean;
  onClose: () => void;
  siteData: import("@/lib/types").SiteData;
  refreshSite: () => void;
}) {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-[#08060f]/90 p-0 backdrop-blur-2xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Admin panel"
          onKeyDown={(e) => {
            if (e.key === "Escape" && username === null) onClose();
          }}
        >
          <AnimatePresence mode="wait">
            {username === null ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="w-full max-w-md"
              >
                <AdminLogin onSuccess={(u) => setUsername(u)} onClose={onClose} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="h-full w-full"
              >
                <AdminDashboard
                  username={username}
                  onLogout={() => setUsername(null)}
                  onClose={onClose}
                  siteData={siteData}
                  refreshSite={refreshSite}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
