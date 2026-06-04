"use client";

import { useState } from "react";
import { Search, Compass, Archive, PanelLeftClose, PanelLeft, Settings, Plus } from "lucide-react";

interface SidebarProps {
  onOpenVault: () => void;
}

const RECENT_THREADS = [
  "Compress 90-day SaaS sprint",
  "First-principles: portfolio site",
  "Audit week 21 execution",
  "Locality arbitrage scan · IN",
  "Recovery sprint protocol",
  "Onboarding recon — locked",
];

export function Sidebar({ onOpenVault }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 transition-[width] duration-500 ease-[var(--transition-spring)] border-r border-border bg-black ${
        isOpen ? "w-[280px]" : "w-[64px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        {isOpen && (
          <div className="flex items-center gap-2.5 pl-2">
            <div className="size-6 rounded-full bg-text-primary" />
            <span className="font-display text-sm font-medium">FP</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="size-9 grid place-items-center rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
        </button>
      </div>

      {/* New Thread Button */}
      <div className="p-3">
        <button
          className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl border border-border bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition text-sm cursor-pointer ${
            isOpen ? "" : "justify-center"
          }`}
        >
          <Plus className="size-4 shrink-0" />
          {isOpen && <span className="font-medium">New thread</span>}
        </button>
      </div>

      {/* Navigation & Recent Threads */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3">
          <nav className="space-y-0.5 mb-6">
            <SidebarNavButton icon={Search} label="Search" />
            <SidebarNavButton icon={Compass} label="Trajectory" active={true} />
            <SidebarNavButton
              icon={Archive}
              label="Vault"
              hint="2×tap"
              onClick={onOpenVault}
            />
          </nav>
          
          <div className="mb-6">
            <div className="px-3 mb-2 text-[11px] text-text-tertiary font-mono tracking-wider">Recent</div>
            <div className="space-y-0.5">
              {RECENT_THREADS.map((thread, index) => (
                <button
                  key={thread}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition truncate cursor-pointer"
                  style={{ opacity: 1 - index * 0.08 }}
                >
                  {thread}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-2 pt-2">
          <SidebarIconButton icon={Search} />
          <SidebarIconButton icon={Compass} active={true} />
          <SidebarIconButton icon={Archive} onClick={onOpenVault} />
        </div>
      )}

      {/* Sidebar Footer / User Profile */}
      <div className="border-t border-border p-3">
        <button
          onClick={onOpenVault}
          className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg hover:bg-white/[0.04] transition text-sm text-text-secondary hover:text-text-primary cursor-pointer ${
            isOpen ? "" : "justify-center"
          }`}
        >
          <div className="size-7 rounded-full bg-white/10 grid place-items-center text-xs font-medium">
            U
          </div>
          {isOpen && (
            <div className="flex-1 text-left">
              <div className="text-xs font-medium text-text-primary">Operator</div>
              <div className="text-[11px] text-text-tertiary">Free plan</div>
            </div>
          )}
          {isOpen && <Settings className="size-4 shrink-0" />}
        </button>
      </div>
    </aside>
  );
}

function SidebarNavButton({
  icon: Icon,
  label,
  active,
  hint,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition cursor-pointer ${
        active
          ? "bg-white/[0.06] text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {hint && (
        <span className="font-mono text-[9px] tracking-widest text-text-tertiary">
          {hint}
        </span>
      )}
    </button>
  );
}

function SidebarIconButton({
  icon: Icon,
  active,
  onClick,
}: {
  icon: any;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`size-10 grid place-items-center rounded-lg transition cursor-pointer ${
        active
          ? "bg-white/[0.06] text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
