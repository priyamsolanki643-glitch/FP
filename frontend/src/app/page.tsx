"use client";

import { useState, useEffect, useRef } from "react";
import { LandingPage } from "@/components/landing-page";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { VaultModal } from "@/components/vault-modal";
import { CommandPalette } from "@/components/command-palette";
import { Archive } from "lucide-react";

export default function EntryPoint() {
  const [isLocked, setIsLocked] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const doubleTapRef = useRef(0);

  // Double-tap to open vault
  useEffect(() => {
    if (!isLocked) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (isVaultOpen || isCommandOpen || target.closest("input, textarea, button, a")) return;

      const now = Date.now();
      if (now - doubleTapRef.current < 320) {
        setIsVaultOpen(true);
        doubleTapRef.current = 0;
      } else {
        doubleTapRef.current = now;
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isLocked, isVaultOpen, isCommandOpen]);

  // ⌘K / Ctrl+K to open command palette
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked]);

  if (!isLocked) {
    return <LandingPage onLock={() => setIsLocked(true)} />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden relative" style={{ background: "#02010a" }}>
      {/* Global aurora orbs behind everything */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-orb aurora-orb-1" style={{ opacity: 0.4 }} />
        <div className="aurora-orb aurora-orb-2" style={{ opacity: 0.3 }} />
        <div className="noise-overlay" />
      </div>

      <Sidebar
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
      />

      <ChatView
        onOpenSidebar={() => {}}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Vault modal */}
      {isVaultOpen && <VaultModal onClose={() => setIsVaultOpen(false)} />}

      {/* Command palette */}
      {isCommandOpen && (
        <CommandPalette
          onClose={() => setIsCommandOpen(false)}
          onOpenVault={() => {
            setIsCommandOpen(false);
            setIsVaultOpen(true);
          }}
        />
      )}

      {/* Mobile FAB — Vault */}
      <button
        onClick={() => setIsVaultOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-40 size-13 grid place-items-center rounded-full bg-text-primary text-black shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open vault"
        style={{ width: "52px", height: "52px" }}
      >
        <Archive className="size-5" />
      </button>
    </div>
  );
}
