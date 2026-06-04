"use client";

import { useState, useEffect } from "react";
import { Lock, X, Activity, BookOpen, Compass, Terminal } from "lucide-react";

interface VaultModalProps {
  onClose: () => void;
}

type TabType = "ledger" | "doctrine" | "arbitrage" | "brain";

const TABS = [
  { id: "ledger" as const, label: "Ledger", icon: Activity },
  { id: "doctrine" as const, label: "Doctrine", icon: BookOpen },
  { id: "arbitrage" as const, label: "Arbitrage", icon: Compass },
  { id: "brain" as const, label: "Brain dump", icon: Terminal },
];

export function VaultModal({ onClose }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ledger");
  const [brainDump, setBrainDump] = useState("");

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
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl cursor-pointer"
      />
      
      {/* Modal Card */}
      <div
        className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-[28px] glass-strong animate-vault-in flex flex-col text-text-primary"
        style={{ boxShadow: "var(--shadow-vault)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Lock className="size-3.5 text-text-secondary" />
            <span className="font-display text-sm font-medium">Vault</span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-text-tertiary ml-2 hidden sm:inline">
              PRIVATE · ENCRYPTED
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-full hover:bg-white/5 text-text-secondary hover:text-text-primary transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 md:px-6 py-3 border-b border-border overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 h-9 rounded-full text-sm whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-text-primary text-black"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                }`}
              >
                <TabIcon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {activeTab === "ledger" && (
            <div className="space-y-3 animate-fade-up">
              {[
                { d: "D02 · 14:22", t: "Read 4 articles on atomic habits", f: "dopamine loop", warn: true },
                { d: "D02 · 09:10", t: "Skipped first sprint window", f: "excuse logged", warn: true },
                { d: "D01 · 18:00", t: "Onboarding recon committed", f: "locked", warn: false },
                { d: "D01 · 11:30", t: "Mapped 12 logistics nodes within 50km", f: "intel", warn: false },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 py-4 border-b border-border last:border-0"
                >
                  <div className="font-mono text-[10px] tracking-widest text-text-tertiary w-24 shrink-0 pt-0.5">
                    {item.d}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{item.t}</div>
                    <div className="font-mono text-[10px] tracking-widest text-text-tertiary mt-1">
                      ▸ {item.f}
                    </div>
                  </div>
                  <div
                    className={`size-1.5 rounded-full mt-2 ${
                      item.warn ? "bg-white/40" : "bg-text-primary"
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "doctrine" && (
            <div className="grid sm:grid-cols-2 gap-3 animate-fade-up">
              {[
                ["Parkinson's compression", "All deadlines cut by 50%."],
                ["First-principles engine", "Every task defined as raw execution units."],
                ["Ego-critique reflex", "Reframe difficulty as doability."],
                ["Calibrated ambition", "Probability over fantasy."],
              ].map(([title, desc], index) => (
                <div key={index} className="rounded-2xl border border-border bg-white/[0.02] p-5">
                  <div className="text-sm font-medium">{title}</div>
                  <div className="font-mono text-[11px] text-text-secondary mt-2 leading-relaxed">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "arbitrage" && (
            <div className="space-y-2 animate-fade-up">
              {[
                ["Logistics centers · 50km", "12 mapped"],
                ["SME automation gaps", "7 active"],
                ["No-code integration deals", "4 in pipe"],
                ["Localized service voids", "9 detected"],
              ].map(([title, val], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-border bg-white/[0.02]"
                >
                  <span className="text-sm">{title}</span>
                  <span className="font-mono text-xs text-text-primary">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "brain" && (
            <div className="animate-fade-up">
              <p className="text-sm text-text-secondary mb-4">
                Pour everything in. No structure. We will parse it into a hard-locked plan.
              </p>
              <div className="rounded-2xl border border-border bg-black/60 p-5 font-mono text-sm min-h-[280px] flex flex-col">
                <div className="text-text-tertiary text-[11px] mb-3 tracking-widest">
                  fp@vault:~$ brain --dump
                </div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="> _"
                  className="flex-1 bg-transparent outline-none resize-none text-text-primary placeholder:text-text-tertiary leading-relaxed"
                />
              </div>
              <button
                disabled={!brainDump.trim()}
                className={`mt-4 w-full h-12 rounded-full font-medium text-sm transition cursor-pointer ${
                  brainDump.trim()
                    ? "bg-text-primary text-black hover:scale-[1.01] active:scale-[0.99]"
                    : "border border-border text-text-tertiary cursor-not-allowed"
                }`}
              >
                Parse → lock into plan
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 h-11 border-t border-border flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-text-tertiary">
          <span>INTEGRITY · 100%</span>
          <span className="hidden sm:inline">ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}
