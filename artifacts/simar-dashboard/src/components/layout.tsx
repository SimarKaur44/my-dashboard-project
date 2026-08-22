import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { ThemeProvider } from "./theme-provider";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function getSavedOpen() {
  try { return localStorage.getItem("simar_sidebar") !== "closed"; } catch { return true; }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(getSavedOpen);

  const toggle = () => setOpen(v => {
    const next = !v;
    try { localStorage.setItem("simar_sidebar", next ? "open" : "closed"); } catch {}
    return next;
  });

  const close = () => {
    setOpen(false);
    try { localStorage.setItem("simar_sidebar", "closed"); } catch {}
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-transparent">

        {/* Backdrop */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={close}
            />
          )}
        </AnimatePresence>

        {/* Sidebar drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50"
            >
              <Sidebar onClose={close} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hamburger toggle — always visible */}
        <button
          onClick={toggle}
          aria-label={open ? "Close menu" : "Open menu"}
          className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-[#5C1D35]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg hover:bg-[#5C1D35] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Main content — full width */}
        <main className="flex-1 overflow-auto relative z-0">
          <div className="max-w-[1400px] mx-auto p-8 pt-20 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
