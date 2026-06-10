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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // God-Level 3D Particle Sphere Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { originalX: number, originalY: number, originalZ: number }[] = [];
    const particleCount = 1200; // Extremely dense star matrix
    let sphereRadius = Math.min(width, height) * 0.45; 
    
    // Fibonacci sphere algorithm for perfect even distribution
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particles.push({
        originalX: x,
        originalY: y,
        originalZ: z,
      });
    }

    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - width / 2;
      const mouseY = e.clientY - height / 2;
      targetRotationY = mouseX * 0.0008; // Sensitivity
      targetRotationX = mouseY * 0.0008;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      sphereRadius = Math.min(width, height) * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Auto-rotation + Kinetic Mouse Interaction with fluid friction
      targetRotationY += 0.002; 
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Apply radius scaling dynamically
        const px = p.originalX * sphereRadius;
        const py = p.originalY * sphereRadius;
        const pz = p.originalZ * sphereRadius;

        // 3D Rotation Matrix
        let x1 = px * cosY - pz * sinY;
        let z1 = pz * cosY + px * sinY;
        
        let y2 = py * cosX - z1 * sinX;
        let z2 = z1 * cosX + py * sinX;

        // 3D to 2D Projection
        const perspective = 1000;
        const scale = perspective / (perspective + z2);
        
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y2 * scale;

        // Depth sorting opacity and size (Z-index illusion)
        const depthRatio = (z2 + sphereRadius) / (sphereRadius * 2);
        const opacity = Math.max(0.1, 1 - depthRatio);
        const radius = Math.max(0.5, 2.2 * scale * opacity);

        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = \`rgba(255, 255, 255, \${opacity * 0.9})\`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
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

        .grid-floor {
          position: absolute;
          width: 200vw;
          height: 100vh;
          bottom: -30vh;
          left: -50vw;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(400px) rotateX(70deg);
          mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%);
          pointer-events: none;
        }

        .eclipse-glow {
          position: absolute;
          top: -20vh;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          height: 100vw;
          max-width: 1200px;
          max-height: 1200px;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 60%);
          border-radius: 50%;
          pointer-events: none;
          animation: eclipsePulse 6s ease-in-out infinite alternate;
        }
        @keyframes eclipsePulse {
          0% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        }

        .shimmer-text-lumensky {
          color: transparent;
          background: linear-gradient(90deg, #444 0%, #fff 40%, #fff 60%, #444 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes shimmer {
          0%  { background-position: -200% 0; }
          to  { background-position:  200% 0; }
        }

        .btn-lumensky-core {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 42px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 16px;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 10;
        }

        .btn-lumensky-core::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          padding: 1px;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .btn-lumensky-core:hover {
          transform: translateY(-2px) scale(1.02);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px -10px rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        .btn-lumensky-core:hover::before {
          opacity: 1;
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

      {/* Lumensky 3D Abyss Environment */}
      <div className="eclipse-glow z-0" />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: isExiting ? 0 : 1, transition: 'opacity 1s ease' }}
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
          <button onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }} className="btn-signin-lumensky">Sign in</button>
          <button onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }} className="btn-login-lumensky">Log in</button>
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
              className="tracking-tighter pb-1.5 text-white/95"
              style={{ fontSize: "clamp(3.0rem, 7.0vw, 5.6rem)", fontWeight: 400 }}
            >
              Stop planning.
            </div>
            
            {/* Second Line - Start executing. */}
            <div 
              className="shimmer-text-lumensky tracking-tighter"
              style={{ fontSize: "clamp(3.2rem, 7.5vw, 6.0rem)", fontWeight: 600, marginTop: "-0.1em" }}
            >
              Start executing.
            </div>
          </h1>

          {/* Subtext */}
          <p className="text-[#a1a1aa] text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto mb-12 font-sans font-normal tracking-wide">
            A strategist and executioner that converts your ambition into
            raw, immutable daily action. No fluff. No excuses. No mercy.
          </p>

          {/* Centered CTA Row */}
          <div className="flex justify-center w-full mt-4">
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
