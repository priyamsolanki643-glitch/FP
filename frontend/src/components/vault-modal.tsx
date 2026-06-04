"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, X, Activity, BookOpen, Compass, Terminal, Sparkles, Shield, CheckCircle2 } from "lucide-react";

interface VaultModalProps {
  onClose: () => void;
}

type TabType = "ledger" | "doctrine" | "arbitrage" | "brain";

const TABS = [
  { id: "ledger" as const,    label: "Ledger",     icon: Activity  },
  { id: "doctrine" as const,  label: "Doctrine",   icon: BookOpen  },
  { id: "arbitrage" as const, label: "Arbitrage",  icon: Compass   },
  { id: "brain" as const,     label: "Brain dump", icon: Terminal  },
];

const LEDGER_ITEMS = [
  { d: "D02 · 14:22", t: "Read 4 articles on atomic habits", f: "dopamine loop", warn: true  },
  { d: "D02 · 09:10", t: "Skipped first sprint window",      f: "excuse logged", warn: true  },
  { d: "D01 · 18:00", t: "Onboarding recon committed",       f: "locked",        warn: false },
  { d: "D01 · 11:30", t: "Mapped 12 logistics nodes · 50km", f: "intel",         warn: false },
];

const DOCTRINE_ITEMS = [
  { icon: "⏱", title: "Parkinson's compression",   desc: "All deadlines cut by 50%." },
  { icon: "⚡", title: "First-principles engine",    desc: "Every task defined as raw execution units." },
  { icon: "🧠", title: "Ego-critique reflex",        desc: "Reframe difficulty as doability." },
  { icon: "🎯", title: "Calibrated ambition",         desc: "Probability over fantasy." },
];

const ARBITRAGE_ITEMS = [
  { title: "Logistics centers · 50km", val: "12 mapped",  pct: 85, color: "bg-violet-500" },
  { title: "SME automation gaps",       val: "7 active",   pct: 58, color: "bg-blue-500"   },
  { title: "No-code integration deals", val: "4 in pipe",  pct: 33, color: "bg-amber-500"  },
  { title: "Localized service voids",   val: "9 detected", pct: 75, color: "bg-emerald-500"},
];

export function VaultModal({ onClose }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ledger");
  const [brainDump, setBrainDump] = useState("");
  const [mounted, setMounted] = useState(false);
  const [integrity, setIntegrity] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Animate integrity counter
    const target = 100;
    let current = 0;
    const step = () => {
      current += 4;
      if (current >= target) { setIntegrity(target); return; }
      setIntegrity(current);
      requestAnimationFrame(step);
    };
    const id = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-8">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(48px) saturate(120%)",
        }}
      />

      {/* Aurora glow behind modal */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, hsl(265,80%,50%) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-[28px] flex flex-col text-text-primary transition-all duration-500 ${mounted ? "animate-vault-in" : "opacity-0"}`}
        style={{
          background: "linear-gradient(145deg, rgba(12,9,26,0.95) 0%, rgba(6,5,16,0.98) 100%)",
          border: "1px solid rgba(139,92,246,0.15)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 4px 8px -2px rgba(0,0,0,0.6), 0 32px 80px -8px rgba(0,0,0,0.9), 0 0 60px -20px rgba(139,92,246,0.3)",
        }}
      >
        {/* Gradient top edge accent */}
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Lock className="size-3.5 text-violet-400" />
            </div>
            <span className="font-display text-sm font-medium text-text-primary">Vault</span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="status-pill">
                <Shield className="size-2.5 text-emerald-400" />
                PRIVATE
              </span>
              <span className="status-pill hidden sm:inline-flex">
                <CheckCircle2 className="size-2.5 text-violet-400" />
                ENCRYPTED
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-full hover:bg-white/[0.06] text-text-tertiary hover:text-text-primary transition-all cursor-pointer group"
            aria-label="Close"
          >
            <X className="size-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 px-4 md:px-6 py-3 border-b border-border-soft overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 h-9 rounded-full text-sm whitespace-nowrap transition-all duration-250 cursor-pointer font-medium ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]"
                }`}
              >
                <TabIcon className={`size-3.5 ${isActive ? "text-violet-400" : ""}`} />
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">

          {/* LEDGER */}
          {activeTab === "ledger" && (
            <div className="space-y-1 animate-fade-up">
              {LEDGER_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 py-4 border-b border-border-soft last:border-0 hover:bg-white/[0.015] rounded-xl px-2 -mx-2 transition-colors duration-150 cursor-default"
                >
                  <div className="font-mono text-[10px] tracking-widest text-text-tertiary w-[90px] shrink-0 pt-0.5 leading-relaxed">
                    {item.d}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary leading-relaxed">{item.t}</div>
                    <div className={`font-mono text-[10px] tracking-widest mt-1 ${item.warn ? "text-amber-500/70" : "text-emerald-500/70"}`}>
                      ▸ {item.f}
                    </div>
                  </div>
                  <div className={`size-2 rounded-full mt-1.5 shrink-0 ${item.warn ? "bg-amber-500/60" : "bg-emerald-500/60"}`} />
                </div>
              ))}
            </div>
          )}

          {/* DOCTRINE */}
          {activeTab === "doctrine" && (
            <div className="grid sm:grid-cols-2 gap-3 animate-fade-up">
              {DOCTRINE_ITEMS.map(({ icon, title, desc }, i) => (
                <div
                  key={i}
                  className="group glass-card rounded-2xl p-5 cursor-pointer hover:border-violet-500/15 hover-lift transition-all duration-200"
                >
                  <div className="text-2xl mb-3">{icon}</div>
                  <div className="text-sm font-medium text-text-primary mb-2">{title}</div>
                  <div className="font-mono text-[11px] text-text-secondary leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* ARBITRAGE */}
          {activeTab === "arbitrage" && (
            <div className="space-y-3 animate-fade-up">
              {ARBITRAGE_ITEMS.map(({ title, val, pct, color }, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-primary">{title}</span>
                    <span className="font-mono text-xs text-text-secondary">{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} opacity-70 transition-all duration-1000 ease-out`}
                      style={{ width: `${pct}%`, transitionDelay: `${i * 100}ms` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="font-mono text-[10px] text-text-tertiary">0</span>
                    <span className="font-mono text-[10px] text-text-tertiary">{pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BRAIN DUMP */}
          {activeTab === "brain" && (
            <div className="animate-fade-up space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                Pour everything in. No structure required.{" "}
                <span className="text-text-tertiary">We will parse it into a hard-locked plan.</span>
              </p>

              <div
                className="rounded-2xl border border-border-soft p-5 font-mono text-sm min-h-[260px] flex flex-col transition-all duration-200 focus-within:border-violet-500/30"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <div className="text-text-tertiary text-[10px] mb-3 tracking-[0.25em] flex items-center gap-2">
                  <Sparkles className="size-3 text-violet-400/60" />
                  fp@vault:~$ brain --dump
                </div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder={">"} 
                  className="flex-1 bg-transparent outline-none resize-none text-text-primary placeholder:text-text-tertiary leading-relaxed cursor-blink"
                  autoFocus
                />
              </div>

              <button
                disabled={!brainDump.trim()}
                className={`w-full h-12 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer ${
                  brainDump.trim()
                    ? "bg-text-primary text-black hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(240,238,232,0.2)] active:scale-[0.99]"
                    : "border border-border-soft text-text-tertiary cursor-not-allowed opacity-50"
                }`}
              >
                {brainDump.trim() ? "Parse → lock into plan" : "Start writing above…"}
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 h-11 border-t border-border-soft flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-text-tertiary">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            INTEGRITY · {integrity}%
          </span>
          <span className="hidden sm:flex items-center gap-3">
            <span>ESC TO CLOSE</span>
            <span className="w-px h-3 bg-border-soft" />
            <span>AES-256</span>
          </span>
        </div>
      </div>
    </div>
  );
}
