"use client";

import { useState } from "react";
import {
  Search, Compass, Archive, PanelLeftClose, PanelLeft,
  Settings, Plus, Zap, TrendingUp, Clock, ChevronRight
} from "lucide-react";

interface SidebarProps {
  onOpenVault: () => void;
  onOpenCommandPalette?: () => void;
}

const RECENT_THREADS = [
  { label: "Compress 90-day SaaS sprint", type: "execution" },
  { label: "First-principles: portfolio site", type: "strategy" },
  { label: "Audit week 21 execution", type: "audit" },
  { label: "Locality arbitrage scan · IN", type: "arbitrage" },
  { label: "Recovery sprint protocol", type: "execution" },
  { label: "Onboarding recon — locked", type: "locked" },
];

const THREAD_COLORS: Record<string, string> = {
  execution: "bg-emerald-500",
  strategy:  "bg-violet-500",
  audit:     "bg-amber-500",
  arbitrage: "bg-blue-500",
  locked:    "bg-white/20",
};

export function Sidebar({ onOpenVault, onOpenCommandPalette }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 transition-[width] duration-500 ease-[var(--transition-spring)] border-r border-border-soft relative overflow-hidden ${
        isOpen ? "w-[280px]" : "w-[64px]"
      }`}
      style={{
        background: "linear-gradient(180deg, rgba(10,8,20,0.95) 0%, rgba(6,5,14,0.98) 100%)",
      }}
    >
      {/* Subtle gradient border on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-500/20 to-transparent pointer-events-none" />

      {/* ── Sidebar Header ── */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border-soft">
        {isOpen && (
          <div className="flex items-center gap-2.5 pl-2 animate-fade-in">
            {/* Pulsing AI indicator dot */}
            <div className="relative size-6">
              <div className="size-6 rounded-full bg-text-primary" />
              <div className="absolute inset-0 rounded-full border border-violet-400/40 animate-ping" style={{ animationDuration: "3s" }} />
            </div>
            <span className="font-display text-sm font-medium text-text-primary">FP</span>
            <span className="font-mono text-[9px] tracking-widest text-violet-400/60 uppercase ml-1">OS</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="size-9 grid place-items-center rounded-lg hover:bg-white/[0.06] text-text-tertiary hover:text-text-secondary transition-all duration-200 cursor-pointer group"
          aria-label="Toggle sidebar"
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? (
            <PanelLeftClose className="size-4 group-hover:scale-95 transition-transform" />
          ) : (
            <PanelLeft className="size-4 group-hover:scale-95 transition-transform" />
          )}
        </button>
      </div>

      {/* ── New Thread Button ── */}
      <div className="p-3">
        <button
          className={`group w-full flex items-center gap-3 px-3 h-10 rounded-xl border border-border-soft bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/25 transition-all duration-200 text-sm cursor-pointer ${
            isOpen ? "" : "justify-center"
          }`}
        >
          <Plus className="size-4 shrink-0 text-text-secondary group-hover:text-text-primary group-hover:rotate-90 transition-all duration-300" />
          {isOpen && (
            <span className="font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              New thread
            </span>
          )}
        </button>
      </div>

      {/* ── Command Palette shortcut ── */}
      {isOpen && (
        <div className="px-3 pb-2">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center gap-2 px-3 h-8 rounded-lg bg-white/[0.02] border border-border-soft hover:bg-white/[0.05] text-text-tertiary hover:text-text-secondary transition-all cursor-pointer"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left text-xs">Search or jump to…</span>
            <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border-soft bg-white/[0.04] tracking-widest">⌘K</kbd>
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-5">
          {/* Nav items */}
          <nav className="space-y-0.5">
            <SidebarNavButton icon={Compass} label="Trajectory" active={true} />
            <SidebarNavButton
              icon={Archive}
              label="Vault"
              hint="2×tap"
              onClick={onOpenVault}
            />
            <SidebarNavButton icon={TrendingUp} label="Progress" />
            <SidebarNavButton icon={Zap} label="Simulations" />
          </nav>

          {/* Recent threads */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary font-mono tracking-[0.2em] uppercase">Recent</span>
              <Clock className="size-3 text-text-tertiary" />
            </div>
            <div className="space-y-0.5">
              {RECENT_THREADS.map((thread, index) => (
                <button
                  key={thread.label}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-150 truncate cursor-pointer group"
                  style={{ opacity: Math.max(0.3, 1 - index * 0.1) }}
                >
                  <span className={`size-1.5 rounded-full shrink-0 ${THREAD_COLORS[thread.type]}`} />
                  <span className="flex-1 truncate text-[13px]">{thread.label}</span>
                  <ChevronRight className="size-3 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed icon-only nav */
        <div className="flex-1 flex flex-col items-center gap-1.5 pt-2 px-2">
          <SidebarIconButton icon={Compass} active={true} tooltip="Trajectory" />
          <SidebarIconButton icon={Archive} onClick={onOpenVault} tooltip="Vault" />
          <SidebarIconButton icon={TrendingUp} tooltip="Progress" />
          <SidebarIconButton icon={Zap} tooltip="Simulations" />
          <div className="mt-2 w-8 h-px bg-border-soft" />
          <SidebarIconButton icon={Search} onClick={onOpenCommandPalette} tooltip="Search ⌘K" />
        </div>
      )}

      {/* ── User Profile / Footer ── */}
      <div className="border-t border-border-soft p-3">
        <button
          className={`group w-full flex items-center gap-3 px-3 h-10 rounded-xl hover:bg-white/[0.05] transition-all duration-200 text-sm cursor-pointer ${
            isOpen ? "" : "justify-center"
          }`}
        >
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="size-7 rounded-full bg-gradient-to-br from-violet-500/60 to-blue-500/60 border border-border-mid grid place-items-center text-[11px] font-semibold text-text-primary">
              U
            </div>
            <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border border-black" />
          </div>
          {isOpen && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-medium text-text-primary leading-tight">Operator</div>
                <div className="text-[10px] text-text-tertiary font-mono leading-tight mt-0.5">Free plan</div>
              </div>
              <Settings className="size-3.5 text-text-tertiary shrink-0 group-hover:text-text-secondary group-hover:rotate-45 transition-all duration-300" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarNavButton({
  icon: Icon, label, active, hint, onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-all duration-200 cursor-pointer relative ${
        active
          ? "nav-active-bar bg-white/[0.07] text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
      }`}
    >
      <Icon className={`size-4 shrink-0 transition-all duration-200 ${active ? "text-violet-400" : "group-hover:text-text-primary"}`} />
      <span className="flex-1 text-left">{label}</span>
      {hint && (
        <span className="font-mono text-[9px] tracking-[0.2em] text-text-tertiary bg-white/[0.04] px-1.5 py-0.5 rounded">
          {hint}
        </span>
      )}
      {active && (
        <div className="size-1.5 rounded-full bg-violet-400/60" />
      )}
    </button>
  );
}

function SidebarIconButton({
  icon: Icon, active, onClick, tooltip,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`group relative size-10 grid place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
        active
          ? "bg-white/[0.08] text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
          : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.05]"
      }`}
    >
      <Icon className="size-4 group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
}
