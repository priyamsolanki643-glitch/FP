"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Timings optimized for cinematic tension and zero lag
    const t1 = setTimeout(() => setPhase(1), 100); // Quantum core ignition
    const t2 = setTimeout(() => setPhase(2), 700); // Wide-tracking snap-focus text reveal
    const t3 = setTimeout(() => setPhase(3), 2400); // Instant exposure blowout (Flash)
    const t4 = setTimeout(() => {
      setPhase(4); // Fade out entire wrapper
      setTimeout(onComplete, 500); // 500ms elegant handover to main app
    }, 2600); // Flash exposure stays for 200ms

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black text-white overflow-hidden transition-opacity duration-400 ease-out ${phase === 4 ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Deep Vignette for absolute center focus */}
      <div className="absolute inset-0 pointer-events-none z-1" style={{ background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.9) 100%)' }} />

      {/* Instant Flash Layer (Zero lag pure CSS opacity, replaces heavy scale/blur) */}
      <div 
        className={`absolute inset-0 bg-white z-50 transition-opacity duration-200 ease-in ${phase >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      <style>{`
        .gyro-container {
          position: relative;
          width: 32px;
          height: 32px;
          perspective: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          transform: translate3d(0, 40px, 0) scale(0.1) rotateX(45deg);
          will-change: transform, opacity;
        }
        .gyro-container.phase-1 {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(2.0) rotateX(0deg);
        }
        
        .gyro-shockwave {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.6);
          opacity: 0;
          transform: translate3d(0, 0, 0) scale(0.5);
          will-change: transform, opacity;
        }
        .gyro-container.phase-1 .gyro-shockwave {
          animation: shockwaveExpand 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shockwaveExpand {
          0% { transform: translate3d(0, 0, 0) scale(0.5); opacity: 1; border-width: 2px; }
          100% { transform: translate3d(0, 0, 0) scale(5); opacity: 0; border-width: 0px; }
        }

        .gyro-core {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          animation: corePulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        .gyro-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.8);
          border-right: 1px solid rgba(255,255,255,0.3);
          will-change: transform;
        }
        /* Exact timings from chat-view */
        .ring-1 { animation: spin1 1.8s linear infinite; }
        .ring-2 { animation: spin2 2.4s linear infinite; }
        .ring-3 { animation: spin3 3s linear infinite; }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          will-change: transform, opacity;
        }
        .gyro-container.phase-1 .p1 { animation: shoot1 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .gyro-container.phase-1 .p2 { animation: shoot2 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .gyro-container.phase-1 .p3 { animation: shoot3 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .gyro-container.phase-1 .p4 { animation: shoot4 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes shoot1 { 0% { transform: translate3d(0,0,0) scale(1); opacity: 1; } 100% { transform: translate3d(-40px, -50px, 0) scale(0); opacity: 0; } }
        @keyframes shoot2 { 0% { transform: translate3d(0,0,0) scale(1); opacity: 1; } 100% { transform: translate3d(60px, -30px, 0) scale(0); opacity: 0; } }
        @keyframes shoot3 { 0% { transform: translate3d(0,0,0) scale(1); opacity: 1; } 100% { transform: translate3d(-50px, 40px, 0) scale(0); opacity: 0; } }
        @keyframes shoot4 { 0% { transform: translate3d(0,0,0) scale(1); opacity: 1; } 100% { transform: translate3d(45px, 55px, 0) scale(0); opacity: 0; } }

        @keyframes spin1 { 
          0% { transform: rotateX(65deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(65deg) rotateY(0deg) rotateZ(360deg); } 
        }
        @keyframes spin2 { 
          0% { transform: rotateX(0deg) rotateY(65deg) rotateZ(0deg); }
          100% { transform: rotateX(0deg) rotateY(65deg) rotateZ(360deg); } 
        }
        @keyframes spin3 { 
          0% { transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(45deg) rotateY(45deg) rotateZ(360deg); } 
        }
        
        @keyframes corePulse {
          0% { transform: translate3d(0, 0, 0) scale(0.5); opacity: 0.3; }
          100% { transform: translate3d(0, 0, 0) scale(1.5); opacity: 1; }
        }

        .lumensky-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px; 
        }
        
        .lumensky-text {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          font-size: 22px;
          letter-spacing: 0.5em; /* Static width to bypass layout recalculations */
          text-transform: uppercase;
          color: #ffffff; /* Static color to bypass paint lag */
          position: absolute;
          white-space: nowrap;
          opacity: 0;
          transform: translate3d(0, 20px, 0) scale(0.95);
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        
        .lumensky-blur {
          filter: blur(8px);
        }
        .lumensky-blur.phase-2 {
          transform: translate3d(0, 0, 0) scale(1.05);
          animation: blurFadeOut 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes blurFadeOut {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }

        .lumensky-sharp {
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lumensky-sharp.phase-2 {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }

        .text-energy-blade {
          position: absolute;
          width: 150%;
          height: 2px;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%); /* Pure GPU gradient */
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0) scaleX(0);
          z-index: 0;
          will-change: transform, opacity;
        }
        .text-energy-blade.phase-2 {
          animation: bladeStrike 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bladeStrike {
          0% { transform: translate3d(-50%, -50%, 0) scaleX(0); opacity: 1; }
          20% { transform: translate3d(-50%, -50%, 0) scaleX(1); opacity: 1; height: 1px; }
          100% { transform: translate3d(-50%, -50%, 0) scaleX(0); opacity: 0; height: 0px; }
        }
      `}</style>

      {/* Absolute Centering Wrapper to guarantee perfect alignment */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        
        {/* 3D Gyroscopic Core with Particles */}
        <div className={`gyro-container mb-12 z-20 ${phase >= 1 ? 'phase-1' : ''}`}>
          <div className="gyro-shockwave"></div>
          {/* High Velocity Particles */}
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          
          <div className="gyro-ring ring-1"></div>
          <div className="gyro-ring ring-2"></div>
          <div className="gyro-ring ring-3"></div>
          <div className="gyro-core"></div>
        </div>

        {/* Lumensky Wordmark Container with Energy Blade */}
        <div className="relative lumensky-container w-full">
          <div className={`text-energy-blade ${phase >= 2 ? 'phase-2' : ''}`}></div>
          
          {/* Static Blur Overlay (Fades out) */}
          <div 
            className={`lumensky-text lumensky-blur z-10 pl-[0.5em] ${phase >= 2 ? 'phase-2' : ''}`}
            aria-hidden="true"
          >
            Lumensky
          </div>

          {/* Sharp Text (Fades in) */}
          <div 
            className={`lumensky-text lumensky-sharp z-10 pl-[0.5em] ${phase >= 2 ? 'phase-2' : ''}`}
          >
            Lumensky
          </div>
        </div>

      </div>
      
    </div>
  );
}
