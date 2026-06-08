"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Initial black screen (0-500ms)
    // Phase 1: Logo fades in and tracks out (500ms - 2000ms)
    // Phase 2: Orb expands / White flash (2000ms - 2800ms)
    // Phase 3: Fading out component (2800ms -> Done)
    
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => {
      setPhase(3);
      setTimeout(onComplete, 800); // Wait for the fade out transition
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 3 ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background grain texture for premium cinematic feel */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .track-in {
          animation: track-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes track-in {
          0% { letter-spacing: -0.05em; transform: scale(0.85); opacity: 0; }
          100% { letter-spacing: -0.02em; transform: scale(1); opacity: 1; }
        }
        
        .orb-expand {
          animation: orb-expand 0.8s cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }
        @keyframes orb-expand {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(100); opacity: 1; }
        }
      `}</style>

      {/* The expanding orb (Phase 2) */}
      {phase >= 2 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full orb-expand z-20" />
      )}

      {/* Main Logo Reveal (Phase 1 & 2) */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 
          className={`text-7xl md:text-9xl lg:text-[150px] font-medium tracking-tighter text-white/90 ${phase >= 1 ? 'track-in' : 'opacity-0'}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          FP
        </h1>
      </div>
      
    </div>
  );
}
