"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hexLines, setHexLines] = useState<string[]>([]);

  const texts = [
    "INITIALIZING KERNEL...",
    "ESTABLISHING NEURAL LINK...",
    "BYPASSING COMFORT PARAMETERS...",
    "SYNCING MARKET INTEL...",
    "FP-OS ONLINE."
  ];

  useEffect(() => {
    // Generate hex dump on client to avoid hydration mismatch
    setHexLines(
      Array.from({ length: 30 }).map(() => 
        Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 255).toString(16).padStart(2, '0')).join(' ')
      )
    );

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + Math.floor(Math.random() * 15) + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setTextIndex(i => Math.min(i + 1, texts.length - 1));
    }, 300);

    const finishTimer = setTimeout(() => {
      setFlash(true);
      setTimeout(() => {
        setFading(true);
        setTimeout(onComplete, 600);
      }, 150);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center font-mono overflow-hidden transition-opacity duration-500 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}>
      
      {flash && <div className="absolute inset-0 bg-white z-[10000] animate-pulse opacity-90" />}

      {/* Hex Dump Background */}
      <div className="absolute inset-0 p-8 opacity-[0.02] text-[10px] leading-loose hidden md:block overflow-hidden pointer-events-none select-none" style={{ fontFamily: 'monospace' }}>
        {hexLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <style>{`
        .splash-glitch { animation: glitch-anim 3s infinite; }
        @keyframes glitch-anim {
          0%, 100% { opacity: 1; transform: translate(0) }
          92% { opacity: 1; transform: translate(0) }
          93% { opacity: 0.8; transform: translate(-3px, 1px) }
          94% { opacity: 0.9; transform: translate(3px, -1px) }
          95% { opacity: 1; transform: translate(-1px, 3px) }
          96% { opacity: 0.9; transform: translate(1px, -3px) }
          97% { opacity: 1; transform: translate(0) }
        }
        .scanline {
          width: 100%; height: 200px;
          background: linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 100%);
          position: absolute; animation: scanline 4s linear infinite; pointer-events: none;
        }
        @keyframes scanline {
          0% { top: -200px; }
          100% { top: 100%; }
        }
      `}</style>
      
      <div className="scanline" />
      
      <div className="w-full max-w-md px-8 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <div className="text-[9px] tracking-[0.3em] text-[#52525b]">FP-OS BOOT SEQUENCE</div>
          <div className="text-[9px] tracking-[0.3em] text-white">v2.0.4</div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-16 splash-glitch flex items-baseline select-none">
          FP<span className="text-[#52525b] text-4xl md:text-6xl">-OS</span>
        </h1>
        
        <div className="text-[10px] tracking-[0.2em] text-[#a1a1aa] uppercase mb-4 h-3 flex items-center gap-2">
          <div className="size-1.5 bg-white animate-pulse" style={{ boxShadow: '0 0 8px white' }} />
          {texts[textIndex]}
        </div>

        <div className="w-full h-[1px] bg-[#18181b] relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-white transition-all duration-75 ease-out"
            style={{ width: `${Math.min(progress, 100)}%`, boxShadow: '0 0 12px rgba(255,255,255,0.8)' }}
          />
        </div>
        
        <div className="flex justify-between items-start mt-3">
          <div className="text-[9px] text-[#52525b] tracking-widest uppercase flex gap-4">
            <span>SYS.MEM: OK</span>
            <span>NET: SECURE</span>
          </div>
          <div className="text-[10px] text-white font-bold tracking-widest">{Math.min(progress, 100)}%</div>
        </div>
      </div>
    </div>
  );
}
