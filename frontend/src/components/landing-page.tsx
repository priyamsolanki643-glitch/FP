"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Play, Zap, Shield, Cpu } from "lucide-react";

interface LandingPageProps {
  onLock: () => void;
}

const STATUS_BADGES = [
  { icon: Shield, label: "ENCRYPTED", color: "text-emerald-400" },
  { icon: Cpu, label: "AI-NATIVE", color: "text-violet-400" },
  { icon: Zap, label: "ZERO LATENCY", color: "text-blue-400" },
];

export function LandingPage({ onLock }: LandingPageProps) {
  const [shutter, setShutter] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStart = () => {
    if (!shutter) {
      setShutter(true);
      setTimeout(onLock, 620);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col select-none">
      {/* Shutter transition */}
      {shutter && <div className="fixed inset-0 z-50 bg-white animate-shutter" />}

      {/* ── Aurora Background Orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        {/* Mouse-reactive spotlight */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(ellipse 40% 40% at ${mousePos.x}% ${mousePos.y}%, rgba(139,92,246,0.06) 0%, transparent 70%)`,
          }}
        />
        {/* Noise grain */}
        <div className="noise-overlay" />
        {/* Dot grid */}
        <div className="dot-grid" />
      </div>

      {/* ── Header ── */}
      <header
        className={`relative z-10 flex items-center justify-between px-6 md:px-10 py-5 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative size-6">
            <div className="size-6 rounded-full bg-text-primary relative ring-pulse" />
          </div>
          <span className="font-display text-sm font-medium tracking-tight text-text-primary">FP</span>
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          <button className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors tracking-widest uppercase">
            Docs
          </button>
          <button className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors tracking-widest uppercase">
            Pricing
          </button>
          <button className="ml-2 px-4 py-2 text-sm font-medium rounded-full border border-border-mid text-text-secondary hover:text-text-primary hover:border-border-strong hover:bg-white/[0.04] transition-all cursor-pointer">
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`max-w-5xl w-full transition-all duration-1000 ease-[var(--transition-smooth)] ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-mono text-violet-300/80 tracking-widest uppercase mb-8">
            <span className="size-1.5 rounded-full bg-violet-400 glow-pulse inline-block" />
            Operating System for Human Ambition
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(3.2rem,10.5vw,7.5rem)] font-medium leading-[0.92] tracking-tight">
            <span className="block text-text-primary">Stop planning.</span>
            <span className="block shimmer-text mt-1">Start executing.</span>
          </h1>

          {/* Subtext */}
          <p
            className={`mt-8 text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            A strategist and executioner that turns your ambition into raw, daily action.{" "}
            <span className="text-text-tertiary">No fluff. No excuses.</span>
          </p>

          {/* CTA Row */}
          <div
            className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Primary button */}
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 pl-7 pr-3 py-3 rounded-full bg-text-primary text-black font-medium text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(240,238,232,0.2)] active:scale-[0.97] cursor-pointer overflow-hidden"
            >
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Get started</span>
              <span className="relative size-8 grid place-items-center rounded-full bg-black/12 group-hover:translate-x-0.5 transition-transform duration-200">
                <ArrowRight className="size-4" />
              </span>
            </button>

            {/* Ghost button */}
            <button className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm text-text-secondary hover:text-text-primary hover:border-border-mid border border-transparent transition-all duration-200 cursor-pointer">
              <span className="size-7 grid place-items-center rounded-full bg-white/[0.06] border border-border-soft group-hover:bg-white/[0.10] transition-colors">
                <Play className="size-3 fill-current" />
              </span>
              Watch demo
            </button>
          </div>

          {/* Status badge row */}
          <div
            className={`mt-14 flex flex-wrap items-center justify-center gap-2 stagger transition-all duration-1000 delay-500 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {STATUS_BADGES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="status-pill animate-fade-in">
                <Icon className={`size-2.5 ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className={`relative z-10 px-6 md:px-10 py-6 flex items-center justify-between text-xs font-mono text-text-tertiary tracking-widest transition-all duration-700 delay-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="uppercase">FP · 2026</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline uppercase hover:text-text-secondary cursor-pointer transition-colors">
            Privacy
          </span>
          <span className="hidden sm:inline uppercase hover:text-text-secondary cursor-pointer transition-colors">
            Terms
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
