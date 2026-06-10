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
    const isMobile = window.innerWidth < 768;
    let sphereRadius = 100; // Will be set in handleResize
    
    // Create a perfect solid sphere (Fibonacci distribution)
    const particleCount = isMobile ? 600 : 1000;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; 
      const radiusAtY = Math.sqrt(1 - y * y); 
      const theta = phi * i; 

      particles.push({
        originalX: Math.cos(theta) * radiusAtY,
        originalY: y,
        originalZ: Math.sin(theta) * radiusAtY,
      });
    }

    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Track globally relative to window center
      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = e.clientY - window.innerHeight / 2;
      targetRotationY = mouseX * 0.002; // Enhanced sensitivity for logo
      targetRotationX = mouseY * 0.002;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const mouseX = touch.clientX - window.innerWidth / 2;
        const mouseY = touch.clientY - window.innerHeight / 2;
        targetRotationY = mouseX * 0.0025; 
        targetRotationX = mouseY * 0.0025;
      }
    };

    let currentWidth = window.innerWidth;
    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (newWidth === currentWidth && canvas.width !== 0) return;
      currentWidth = newWidth;
      
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
      } else {
        width = 250; height = 250;
      }
      
      canvas.width = width;
      canvas.height = height;
      // Fits beautifully inside the logo container
      sphereRadius = width * 0.42;
    };
    handleResize(); // Initialize correct responsive size

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Additive blending for a Trillion-Dollar Neon Glow
      ctx.globalCompositeOperation = "lighter";
      
      // Auto-rotation + Kinetic Mouse Interaction with fluid friction
      targetRotationY += 0.002; 
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      const time = Date.now() * 0.001;
      const breatheScale = 1 + Math.sin(time * 1.5) * 0.03; // Gentle psychological breathing
      const currentRadius = sphereRadius * breatheScale;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Apply radius scaling dynamically
        const px = p.originalX * currentRadius;
        const py = p.originalY * currentRadius;
        const pz = p.originalZ * currentRadius;

        // 3D Rotation Matrix
        let x1 = px * cosY - pz * sinY;
        let z1 = pz * cosY + px * sinY;
        
        let y2 = py * cosX - z1 * sinX;
        let z2 = z1 * cosX + py * sinX;

        // 3D to 2D Projection
        const perspective = 800; // Tighter perspective for small logo
        const scale = perspective / (perspective + z2);
        
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y2 * scale;

        // Depth sorting opacity and size (Z-index illusion)
        const depthRatio = (z2 + currentRadius) / (currentRadius * 2);
        // Exponential fade: front particles are bright, back particles fade fast
        const opacity = Math.max(0.05, 1 - Math.pow(depthRatio, 1.5));
        
        // Solid sphere dots
        const radius = Math.max(0.5, 2.0 * scale * opacity);

        // Pure White / Titanium Aesthetics (Ultimate Trillion-Dollar Minimalism)
        const r = 255, g = 255, b = 255;

        // 120FPS Optimization: Only draw the expensive bloom aura for front-facing particles
        if (opacity > 0.4) {
          ctx.beginPath();
          ctx.arc(projX, projY, radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.15})`;
          ctx.fill();
        }

        // Draw bright inner core
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.9})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
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

        /* Psychological Dominance CTA: Blinding White -> Transparent */
        .btn-lumensky-core {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 48px;
          border-radius: 9999px;
          background: #ffffff;
          color: #000000;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.02em;
          border: 1px solid #ffffff;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.15), 0 0 80px rgba(255, 255, 255, 0.05);
          animation: coreBreathe 3s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes coreBreathe {
          0% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.1); transform: scale(1); }
          100% { box-shadow: 0 0 60px rgba(255, 255, 255, 0.3), 0 0 100px rgba(255, 255, 255, 0.15); transform: scale(1.02); }
        }

        .btn-lumensky-core:hover {
          transform: translateY(-2px) scale(1.05) !important;
          background: transparent;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 50px rgba(255, 255, 255, 0.2);
          animation: none;
        }

        .btn-lumensky-core:active {
          transform: translateY(1px) scale(0.98) !important;
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
          {/* 3D Gyro Sphere (Absolutely positioned above so it NEVER pushes text down) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[100%] mb-1 w-[180px] h-[180px] md:w-[220px] md:h-[220px] flex items-center justify-center cursor-crosshair pointer-events-auto">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-auto"
            />
          </div>

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
              className="shimmer-text-lumensky tracking-tighter pb-2 md:pb-4 leading-[1.15] whitespace-nowrap"
              style={{ fontSize: "clamp(2.5rem, 12vw, 6.8rem)", fontWeight: 600, marginTop: "-0.05em" }}
            >
              Start executing.
            </div>
          </h1>

          {/* Subtext */}
          <p className="text-[#a1a1aa] text-[14px] sm:text-[16px] md:text-[19px] leading-relaxed max-w-xl mx-auto mb-10 px-2 font-sans font-normal tracking-wide">
            A strategist and executioner that converts your ambition into
            raw, immutable daily action. No fluff. No excuses. No mercy.
          </p>

          {/* Centered CTA Row */}
          <div className="flex justify-center w-full mt-2">
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
