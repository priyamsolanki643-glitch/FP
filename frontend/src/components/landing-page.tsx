"use client";

import { useState, useEffect, useRef } from "react";
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
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    if (hasSession) {
      if (!isExiting) {
        setIsExiting(true);
        setTimeout(onLock, 500);
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
      setTimeout(onLock, 500);
    }
  };

  return (
    <div className="lp-root relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans">

      {/* Standard React CSS Injector */}
      <style>{`
        .lp-root {
          background-color: #000000 !important;
          background-image: none !important;
        }

        .eclipse-glow {
          position: absolute;
          bottom: 5vh;
          left: 50%;
          transform: translateX(-50%);
          width: 80vw;
          height: 80vw;
          max-width: 600px;
          max-height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .gradient-text-lumensky {
          color: transparent;
          background: linear-gradient(to right, #666666 0%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        /* Psychological Dominance CTA: Black Pill with Glow */
        .btn-lumensky-core {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 42px;
          border-radius: 9999px;
          background: #000000;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 10px 40px rgba(255, 255, 255, 0.1);
        }

        .btn-lumensky-core:hover {
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 50px rgba(255, 255, 255, 0.15);
        }

        .btn-lumensky-core:active {
          transform: translateY(1px) scale(0.98);
        }

        .btn-lumensky-core .arrow-icon {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-lumensky-core:hover .arrow-icon {
          transform: translateX(4px);
        }

        .btn-signin-lumensky {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          cursor: pointer;
          font-size: 13px;
          padding: 8px 20px;
          color: #ffffff;
          font-weight: 500;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-signin-lumensky:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .btn-login-lumensky {
          background: #ffffff;
          border: 1px solid #ffffff;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 13px;
          padding: 8px 20px;
          color: #000000;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
        }
        .btn-login-lumensky:hover {
          background: #f4f4f5;
          transform: translateY(-1px);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* ── Header ── */}
      <header 
        className="flex items-center justify-end px-6 py-5 md:px-12 relative z-10 w-full"
        style={{
          transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: isExiting ? 0 : (visible ? 1 : 0),
          transform: isExiting ? "translate3d(0, -20px, 0) scale(0.95)" : (visible ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, -10px, 0) scale(0.98)"),
          willChange: "transform, opacity",
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }} className="btn-signin-lumensky">Sign in</button>
          <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="btn-login-lumensky">Log in</button>
        </div>
      </header>

      {/* ── Hero Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 max-w-4xl mx-auto w-full pointer-events-none">
        <div 
          className="flex flex-col items-center w-full relative pointer-events-auto"
          style={{
            transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: isExiting ? 0 : (visible ? 1 : 0),
            transform: isExiting ? "scale(0.85) translate3d(0, -60px, 0)" : (visible ? "scale(1) translate3d(0, 0, 0)" : "scale(0.95) translate3d(0, 20px, 0)"),
            willChange: "transform, opacity",
          }}
        >
          {/* Headline */}
          <h1 className="text-white font-medium font-display mb-6 flex flex-col items-center">
            {/* First Line - Stop planning. */}
            <div 
              className="tracking-tighter pb-1 text-white/95 leading-[1.1] whitespace-nowrap"
              style={{ fontSize: "clamp(1.8rem, 9.5vw, 5.0rem)", fontWeight: 400 }}
            >
              Stop planning.
            </div>
            
            {/* Second Line - Start executing. */}
            <div 
              className="gradient-text-lumensky tracking-tighter pb-2 md:pb-4 leading-[1.15] whitespace-nowrap"
              style={{ fontSize: "clamp(2.5rem, 12vw, 6.8rem)", fontWeight: 600, marginTop: "-0.05em" }}
            >
              Start executing.
            </div>
          </h1>

          {/* Subtext */}
          <p className="text-[#a1a1aa] text-[14px] sm:text-[16px] md:text-[19px] leading-relaxed max-w-xl mx-auto mb-10 px-2 font-sans font-normal tracking-wide">
            A strategist and executioner that converts your ambition into raw, immutable daily action. No fluff. No excuses. No mercy.
          </p>

          {/* Centered CTA Row */}
          <div className="flex justify-center w-full mt-2">
            <div className="eclipse-glow"></div>
            <button onClick={handleStart} className="btn-lumensky-core group">
              <span>Get started</span>
              <ArrowRight size={18} className="arrow-icon opacity-80 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </main>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} initialMode={authMode} />}

      {/* ── Empty/Hidden Clean Footer ── */}
      <footer className="px-6 py-6 md:px-12 relative z-10 h-10 w-full" />
    </div>
  );
}
