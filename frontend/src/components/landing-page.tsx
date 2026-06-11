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
  const [isHovered, setIsHovered] = useState(false); // For Domain Expansion Aura

  useEffect(() => {
    // Sharp entry timing
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    if (hasSession) {
      if (!isExiting) {
        setIsExiting(true);
        setTimeout(onLock, 600);
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
      setTimeout(onLock, 600);
    }
  };

  return (
    <div className={`lp-root relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-700 ${isHovered ? 'bg-[#050505]' : 'bg-black'}`}>

      {/* Standard React CSS Injector */}
      <style>{`
        .lp-root {
          /* Force pure black void */
          background-image: none !important;
        }

        /* The Deep Aura (Domain Expansion) - Expands when CTA is hovered */
        .domain-aura {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0vw;
          height: 0vw;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1), height 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease;
          opacity: 0;
          z-index: 0;
        }
        .domain-aura.active {
          width: 150vw;
          height: 150vw;
          opacity: 1;
        }

        /* Katana Slicing Text Effect */
        .katana-container {
          position: relative;
          display: inline-block;
          overflow: hidden; /* Hide text before slice */
        }
        
        .katana-text {
          display: inline-block;
          opacity: 0;
          transform: translateX(-20px);
          animation: katanaSnap 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.8s;
        }

        .katana-blade {
          position: absolute;
          top: 0;
          left: -10px;
          width: 4px;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 20px #ffffff, 0 0 40px #ffffff;
          opacity: 0;
          transform: skewX(-15deg);
          animation: katanaCut 1.2s cubic-bezier(0.8, 0, 0.2, 1) forwards;
          animation-delay: 0.5s;
          z-index: 10;
        }

        @keyframes katanaCut {
          0% { left: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { left: 110%; opacity: 1; }
          100% { left: 120%; opacity: 0; }
        }

        @keyframes katanaSnap {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        /* Glitch Typewriter Subtext */
        .glitch-subtext {
          opacity: 0;
          transform: translateY(10px);
          animation: glitchIn 0.8s ease-out forwards;
          animation-delay: 1.4s;
        }
        @keyframes glitchIn {
          0% { opacity: 0; transform: translateY(10px); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }

        /* Monolithic CTA Button - Pure Brutalism */
        .btn-monolith {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 20px 56px;
          background: #ffffff;
          color: #000000;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          outline: none;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease, color 0.4s ease;
          z-index: 10;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.8s;
        }
        
        .btn-monolith::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,0);
          transition: inset 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }

        .btn-monolith:hover {
          background: #000000;
          color: #ffffff;
          transform: scale(1.02);
        }

        .btn-monolith:hover::after {
          inset: -6px;
          border-color: rgba(255,255,255,0.4);
        }

        .btn-monolith:active {
          transform: scale(0.98);
        }

        .btn-monolith .arrow-icon {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-monolith:hover .arrow-icon {
          transform: translateX(8px);
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Header Auth Buttons - Invisible until needed */
        .btn-auth-stealth {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .btn-auth-stealth:hover {
          color: #ffffff;
        }
        
        .btn-auth-login {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
        }
        .btn-auth-login:hover {
          background: #ffffff;
          color: #000000;
        }
      `}</style>

      {/* The Expanding Aura Background */}
      <div className={`domain-aura ${isHovered ? 'active' : ''}`}></div>

      {/* ── Header ── */}
      <header 
        className="flex items-center justify-end px-6 py-8 md:px-12 relative z-10 w-full"
        style={{
          transition: "opacity 1s ease",
          opacity: visible && !isExiting ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }} className="btn-auth-stealth">Sign in</button>
          <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="btn-auth-stealth btn-auth-login">Log in</button>
        </div>
      </header>

      {/* ── Hero Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 max-w-5xl mx-auto w-full pointer-events-none">
        <div 
          className="flex flex-col items-center w-full relative pointer-events-auto"
          style={{
            transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: isExiting ? 0 : (visible ? 1 : 0),
            transform: isExiting ? "scale(0.9) translateZ(0)" : (visible ? "scale(1) translateZ(0)" : "scale(0.95) translateZ(0)"),
            willChange: "transform, opacity",
          }}
        >
          {/* Headline */}
          <h1 className="text-white font-medium font-display mb-8 flex flex-col items-center">
            {/* Line 1: Silent Arrival */}
            <div 
              className="tracking-tighter pb-1 text-white/60 leading-[1.1] whitespace-nowrap"
              style={{ 
                fontSize: "clamp(1.5rem, 8vw, 4.0rem)", 
                fontWeight: 200,
                opacity: visible ? 1 : 0,
                transition: "opacity 1s ease 0.2s"
              }}
            >
              Stop planning.
            </div>
            
            {/* Line 2: The Katana Reveal */}
            <div className="katana-container mt-1">
              <div className="katana-blade"></div>
              <div 
                className="katana-text tracking-tighter pb-2 leading-[1.0] whitespace-nowrap text-white"
                style={{ fontSize: "clamp(2.5rem, 13vw, 7.5rem)", fontWeight: 800 }}
              >
                Start executing.
              </div>
            </div>
          </h1>

          {/* Brutalist Subtext */}
          <p className="glitch-subtext text-[#888888] text-[13px] sm:text-[15px] md:text-[16px] leading-relaxed max-w-xl mx-auto mb-16 px-2 font-sans font-light tracking-[0.05em] uppercase">
            A strategist and executioner that converts your ambition into raw, immutable daily action. No fluff. No excuses. No mercy.
          </p>

          {/* The Monolith CTA */}
          <div 
            className="flex justify-center w-full mt-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button onClick={handleStart} className="btn-monolith group">
              <span>Enter Domain</span>
              <ArrowRight size={20} className="arrow-icon" />
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
