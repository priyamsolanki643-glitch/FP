"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";

interface LandingPageProps {
  onLock: () => void;
  hasSession: boolean;
}

export function LandingPage({ onLock, hasSession }: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    // Elegant ultra-smooth fade in
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    if (hasSession) {
      if (!isExiting) {
        setIsExiting(true);
        setTimeout(onLock, 700); // Wait for exit animation
      }
    } else {
      setAuthMode("signup");
      setIsAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(onLock, 700);
    }
  };

  return (
    <div className="lp-root relative min-h-screen bg-[#000000] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* ── The Void: Micro-Grain ── */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay z-0"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* ── The Breathing Eclipse (Center Bottom) ── */}
      <div className="absolute bottom-[-15vh] left-1/2 -translate-x-1/2 w-[150vw] md:w-[100vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035)_0%,rgba(0,0,0,0)_60%)] pointer-events-none z-0 animate-eclipse-breathe" />

      {/* Standard React CSS Injector */}
      <style>{`
        .lp-root {
          background-color: #000000 !important;
        }

        @keyframes eclipseBreathe {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(1.05); }
        }
        .animate-eclipse-breathe {
          animation: eclipseBreathe 8s ease-in-out infinite;
        }

        /* Obsidian Glass Pill CTA */
        .btn-obsidian {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 48px;
          border-radius: 9999px;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 17px;
          letter-spacing: 0.03em;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.15), /* Inner top highlight */
            inset 0 -1px 1px rgba(0, 0, 0, 0.5), /* Inner bottom shadow */
            0 15px 35px rgba(0, 0, 0, 0.5), /* Drop shadow */
            0 0 20px rgba(255, 255, 255, 0.02); /* Ambient glow */
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease;
          z-index: 10;
        }

        .btn-obsidian::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          box-shadow: inset 0 0 20px rgba(255,255,255,0.05);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .btn-obsidian:active {
          transform: scale(0.94);
          background: rgba(30, 30, 30, 0.6);
        }
        .btn-obsidian:active::after {
          opacity: 1;
        }

        .btn-obsidian .arrow-icon {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-obsidian:active .arrow-icon {
          transform: translateX(4px);
        }

        /* Ghost Auth Buttons */
        .btn-ghost-auth {
          background: transparent;
          color: #888888;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 9999px;
          transition: color 0.3s ease, background 0.3s ease;
        }
        .btn-ghost-auth:active {
          color: #ffffff;
          background: rgba(255,255,255,0.05);
        }
        
        .god-text-shadow {
          text-shadow: 0 4px 24px rgba(255, 255, 255, 0.25);
        }

        .shimmer-text-lumensky {
          color: transparent;
          background: linear-gradient(90deg, #666 0%, #fff 40%, #fff 60%, #666 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        @keyframes shimmer {
          0%  { background-position: -200% 0; }
          to  { background-position:  200% 0; }
        }

        .btn-eclipse-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 60px;
          background: rgba(255, 255, 255, 0.15);
          filter: blur(25px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      {/* ── Header (Ultra Minimal) ── */}
      <header 
        className="flex items-center justify-end px-6 py-6 relative z-10 w-full transition-opacity duration-700"
        style={{ opacity: visible && !isExiting ? 1 : 0 }}
      >
        <div className="flex items-center gap-1">
          <button onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }} className="btn-ghost-auth">Sign in</button>
          <div className="w-1 h-1 rounded-full bg-[#333]"></div>
          <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="btn-ghost-auth">Log in</button>
        </div>
      </header>

      {/* ── Hero Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 max-w-4xl mx-auto w-full">
        <div 
          className="flex flex-col items-center w-full relative"
          style={{
            transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: isExiting ? 0 : (visible ? 1 : 0),
            transform: isExiting ? "scale(0.9) translateY(-40px)" : (visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)"),
            willChange: "transform, opacity",
          }}
        >
          {/* Headline */}
          <h1 className="font-display mb-8 flex flex-col items-center">
            {/* First Line */}
            <div 
              className="tracking-tight pb-1 text-[#a1a1aa] leading-[1.0] whitespace-nowrap"
              style={{ fontSize: "clamp(2.0rem, 10vw, 5.0rem)", fontWeight: 400 }}
            >
              Stop planning.
            </div>
            
            {/* Second Line */}
            <div 
              className="tracking-tighter pb-2 leading-[1.1] whitespace-nowrap"
              style={{ fontSize: "clamp(2.8rem, 13vw, 7.2rem)", fontWeight: 500, marginTop: "-0.02em" }}
            >
              <span className="shimmer-text-lumensky god-text-shadow">
                Start executing.
              </span>
            </div>
          </h1>

          {/* Subtext */}
          <p className="text-[#a1a1aa] text-[15px] sm:text-[17px] leading-snug max-w-[90%] sm:max-w-md mx-auto mb-10 font-sans font-normal opacity-90">
            Built to make achievers, not procrastinators.<br />
            <span className="text-white/70 font-medium">No fluff. No excuses. No mercy.</span>
          </p>

          {/* Centered CTA Row */}
          <div className="flex justify-center w-full relative">
            <div className="btn-eclipse-glow"></div>
            <button className="btn-obsidian group" onClick={handleStart} style={{ zIndex: 10 }}>
              <span>Get started</span>
              <ArrowRight size={20} className="arrow-icon text-white/70 group-active:text-white" />
            </button>
          </div>
        </div>
      </main>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} initialMode={authMode} />}

      {/* ── Empty/Hidden Clean Footer ── */}
      <footer className="h-12 w-full" />
    </div>
  );
}
