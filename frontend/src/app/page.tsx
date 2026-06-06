"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { LandingPage } from "@/components/landing-page";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { VaultModal } from "@/components/vault-modal";
import { Archive } from "lucide-react";

export default function EntryPoint() {
  const [isLocked, setIsLocked] = useState(false);
  const [hasActiveMission, setHasActiveMission] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const doubleTapRef = useRef(0);

  useEffect(() => {
    const checkActiveMission = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/interaction/active-mission`);
        const result = await res.json();
        if (result?.data) {
          setHasActiveMission(true);
        }
      } catch (err) {
        console.error("Failed checking active mission status:", err);
      }
    };
    
    const checkSession = async () => {
      // Immediately hide landing page if there's a token in the URL
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        setIsLocked(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLocked(true);
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkActiveMission();
    checkSession();
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    const handlePointerDown = (e: PointerEvent) => {
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
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onOpenVault={() => setIsVaultOpen(true)} 
        onSignOut={async () => {
          await supabase.auth.signOut();
          setIsLocked(false);
        }}
      />
      
      <ChatView
        onOpenSidebar={() => setIsSidebarOpen(true)}
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
