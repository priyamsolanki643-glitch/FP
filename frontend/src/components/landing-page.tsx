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
        /* Overriding global landing page styles for pure flat black background */
        .lp-root {
          background-color: #000000 !important;
          background-image: none !important;
        }
        
        /* Shimmer text with electric green gradient */
        .shimmer-text-white {
          color: transparent;
          background: linear-gradient(90deg, #52525b, #ffffff, #ffffff, #ffffff, #52525b) 0 0 / 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: 4s linear infinite shimmer;
        }

        @keyframes shimmer {
          0%  { background-position: -200% 0; }
          to  { background-position:  200% 0; }
        }

        /* Premium Green Glowing Button */
        .btn-neon-white {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 36px;
          border-radius: 9999px;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-sans), sans-serif;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.15), 0 0 40px rgba(255, 255, 255, 0.08);
        }

        .btn-neon-white:hover {
          transform: translateY(-2px) scale(1.02);
          background: #f4f4f5;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.35), 0 0 60px rgba(255, 255, 255, 0.15);
        }

        .btn-neon-white:active {
          transform: translateY(0) scale(0.98);
        }

        /* Arrow animation inside button */
        .btn-neon-white .arrow-icon {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-neon-white:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* Beautiful Green Header Actions */
        .btn-signin-green {
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

        .btn-signin-green:hover {
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .btn-login-green {
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

        .btn-login-green:hover {
          background: #f4f4f5;
          border-color: #f4f4f5;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        /* Smooth Spring Reveal Transitions (Trajectory Forge replica) */
        .lp-header-reveal {
          transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lp-hero-reveal {
          transition: opacity 1000ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.01]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

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
          <button onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }} className="btn-signin-green">Sign in</button>
          <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="btn-login-green">Log in</button>
        </div>
      </header>

      {/* ── Hero Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 max-w-4xl mx-auto w-full">
        <div 
          className="flex flex-col items-center w-full"
          style={{
            transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: isExiting ? 0 : (visible ? 1 : 0),
            transform: isExiting ? "scale(0.85) translate3d(0, -60px, 0)" : (visible ? "scale(1) translate3d(0, 0, 0)" : "scale(0.95) translate3d(0, 20px, 0)"),
            willChange: "transform, opacity",
          }}
        >
          {/* Headline */}
          <h1 className="text-white leading-[1.05] font-medium font-display mb-8">
            {/* First Line - Stop planning. */}
            <div 
              className="tracking-[-0.03em] pb-1.5"
              style={{ fontSize: "clamp(3.0rem, 7.0vw, 5.6rem)" }}
            >
              Stop planning.
            </div>
            
            {/* Second Line - Start executing. */}
            <div 
              className="shimmer-text-white mt-1 pb-3 tracking-[-0.02em]"
              style={{ fontSize: "clamp(3.4rem, 8.0vw, 6.4rem)" }}
            >
              Start executing.
            </div>
          </h1>

          {/* Subtext */}
          <p className="text-[#a1a1aa] text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto mb-12 font-sans font-normal">
            A strategist and executioner that converts your ambition into
            raw, immutable daily action. No fluff. No excuses. No mercy.
          </p>

          {/* Centered CTA Row */}
          <div className="flex justify-center w-full">
            <button onClick={handleStart} className="btn-neon-white">
              Get started
              <ArrowRight size={16} className="arrow-icon" />
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
