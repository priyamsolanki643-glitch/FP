"use client";

import { useState, useEffect, useRef } from "react";
import { LandingPage } from "@/components/landing-page";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { VaultModal } from "@/components/vault-modal";
import { Archive } from "lucide-react";

export default function EntryPoint() {
  const [isLocked, setIsLocked] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const doubleTapRef = useRef(0);

  useEffect(() => {
    if (!isLocked) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore clicks on inputs, buttons, textarea, links
      const target = e.target as HTMLElement;
      if (isVaultOpen || target.closest("input, textarea, button, a")) return;

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
  }, [isLocked, isVaultOpen]);

  if (!isLocked) {
    return <LandingPage onLock={() => setIsLocked(true)} />;
  }

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden relative">
      <Sidebar onOpenVault={() => setIsVaultOpen(true)} />
      
      <ChatView
        onOpenSidebar={() => {}} // Desktop sidebar is toggleable; mobile sidebar is hidden.
        onOpenVault={() => setIsVaultOpen(true)}
      />
      
      {isVaultOpen && <VaultModal onClose={() => setIsVaultOpen(false)} />}
      
      {/* Floating Action Button for mobile vault access */}
      <button
        onClick={() => setIsVaultOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 size-12 grid place-items-center rounded-full bg-text-primary text-black shadow-2xl cursor-pointer"
        aria-label="Open vault"
      >
        <Archive className="size-5" />
      </button>
    </div>
  );
}
