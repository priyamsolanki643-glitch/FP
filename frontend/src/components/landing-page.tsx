"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface LandingPageProps {
  onLock: () => void;
}

export function LandingPage({ onLock }: LandingPageProps) {
  const [shutter, setShutter] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    if (!shutter) {
      setShutter(true);
      setTimeout(onLock, 620);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col text-text-primary font-sans">
      {shutter && (
        <div className="fixed inset-0 z-50 bg-white animate-shutter" />
      )}
      
      <header className="flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-full bg-text-primary" />
          <span className="font-display text-sm font-medium tracking-tight">FP</span>
        </div>
        <button className="text-sm text-text-secondary hover:text-text-primary transition">
          Sign in
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`transition-all duration-1000 ease-[var(--transition-spring)] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="font-display text-[clamp(3rem,10vw,7rem)] font-medium leading-[0.95] tracking-tight max-w-4xl">
            Stop planning.
            <br />
            <span className="shimmer-text">Start executing.</span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            A strategist and executioner that turns your ambition into raw, daily action. No fluff. No excuses.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 pl-7 pr-3 py-3 rounded-full bg-text-primary text-black font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Get started
              <span className="size-8 grid place-items-center rounded-full bg-black/15 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="size-4" />
              </span>
            </button>
            <button className="px-6 py-3 rounded-full text-sm text-text-secondary hover:text-text-primary transition cursor-pointer">
              Watch demo
            </button>
          </div>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-6 text-center text-xs text-text-tertiary">
        FP · 2026
      </footer>
    </div>
  );
}
