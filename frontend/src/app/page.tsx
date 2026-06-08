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
        const res = await fetch(`${baseUrl}/api/v1/interaction/active-mission`, {
          headers: { "Authorization": "Bearer test-user" }
        });
        const result = await res.json();
        if (result?.data) {
          setHasActiveMission(true);
        }
      } catch (err) {
        console.error("Failed checking active mission status:", err);
      }
    };
    
    const checkSession = async () => {
      // If there's an access token in the URL, wait a moment for Supabase to automatically process it
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        setIsLocked(true); // Optimistically lock immediately
        // We do NOT manually parse or clear the hash here. Supabase's internal logic 
        // needs the hash to be present to verify the session. It will clear it automatically.
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLocked(true);
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth event:", event, session ? "Session exists" : "No session");
          if (session) {
            setIsLocked(true);
          } else {
            // BYPASS FOR LOCAL TESTING: Don't lock the user out if they have no session
            // if (typeof window !== 'undefined' && !window.location.hash.includes('access_token')) {
            //   setIsLocked(false);
            // }
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkActiveMission();
    checkSession();
    // FORCE UNLOCK FOR TESTING:
    setIsLocked(true);
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
      
    </div>
  );
}
