"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Timings optimized for zero lag, surgical alignment, and rapid pacing
    const t1 = setTimeout(() => setPhase(1), 150); // Core ignition
    const t2 = setTimeout(() => setPhase(2), 800); // Lumensky wordmark tracking & focus
    const t3 = setTimeout(() => setPhase(3), 2100); // Instant snappy flash burst
    const t4 = setTimeout(() => {
      setPhase(4); // Fade out entire wrapper
      setTimeout(onComplete, 400); // Fast 400ms handover to main app
    }, 2350); // Flash stays for exactly 250ms

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
      {/* Background grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Instant Flash Layer (Zero lag pure CSS opacity, replaces heavy scale/blur) */}
      <div 
        className={`absolute inset-0 bg-white z-50 transition-opacity duration-200 ease-in ${phase >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      <style>{`
        .gyro-container {
          position: relative;
          width: 22px;
          height: 22px;
          perspective: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Elite spring-physics bezier for a cinematic pop */
          transition: opacity 0.8s ease-out, transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          transform: scale(0.1) translateY(40px);
        }
        .gyro-container.phase-1 {
          opacity: 1;
          transform: scale(2.2) translateY(0);
        }

        .gyro-core {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          animation: corePulse 1.5s ease-in-out infinite alternate;
        }
        .gyro-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid transparent;
          border-top: 2px solid rgba(255,255,255,1);
          border-right: 1.5px solid rgba(255,255,255,0.4);
          border-left: 1px solid rgba(255,255,255,0.1);
        }
        /* Exact timings from chat-view */
        .ring-1 { animation: spin1 1.8s linear infinite; }
        .ring-2 { animation: spin2 2.4s linear infinite; }
        .ring-3 { animation: spin3 3s linear infinite; }

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
          0% { transform: scale(0.8); opacity: 0.6; box-shadow: 0 0 2px rgba(255,255,255,0.4); }
          100% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 6px rgba(255,255,255,0.8); }
        }

        .lumensky-text {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          font-size: 22px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #444 0%, #fff 50%, #444 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .lumensky-text.phase-2 {
          opacity: 1;
          animation: textShimmer 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite, cinematicFocus 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes textShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cinematicFocus {
          0% { letter-spacing: 0.8em; transform: translateY(12px); filter: blur(5px); }
          100% { letter-spacing: 0.5em; transform: translateY(0); filter: blur(0px); }
        }
      `}</style>

      {/* Absolute Centering Wrapper to guarantee perfect alignment */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        
        {/* 3D Gyroscopic Core */}
        <div className={`gyro-container mb-12 z-20 ${phase >= 1 ? 'phase-1' : ''}`}>
          <div className="gyro-ring ring-1"></div>
          <div className="gyro-ring ring-2"></div>
          <div className="gyro-ring ring-3"></div>
          <div className="gyro-core"></div>
        </div>

        {/* Lumensky Wordmark with dynamic padding to offset letter-spacing optical illusion */}
        <div 
          className={`lumensky-text z-10 pl-[0.5em] ${phase >= 2 ? 'phase-2' : ''}`}
        >
          Lumensky
        </div>

      </div>
      
    </div>
  );
}
