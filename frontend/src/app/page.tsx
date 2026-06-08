"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { LandingPage } from "@/components/landing-page";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { VaultModal } from "@/components/vault-modal";
import { SplashScreen } from "@/components/splash-screen";
import { Archive } from "lucide-react";

export default function EntryPoint() {
  const [isLocked, setIsLocked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [hasActiveMission, setHasActiveMission] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
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
        setHasSession(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth event:", event, session ? "Session exists" : "No session");
          if (session) {
            setHasSession(true);
          } else {
            setHasSession(false);
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

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isLocked) {
    return <LandingPage onLock={() => setIsLocked(true)} hasSession={hasSession} />;
  }

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden relative animate-app-in">
      <style>{`
        @keyframes app-in {
          0% { transform: scale(1.05) translate3d(0, 30px, 0); opacity: 0; }
          100% { transform: scale(1) translate3d(0, 0, 0); opacity: 1; }
        }
        .animate-app-in {
          animation: app-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>
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
