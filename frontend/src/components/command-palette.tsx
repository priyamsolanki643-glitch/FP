"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Archive, Compass, TrendingUp, Zap,
  FileText, Settings, ChevronRight, Clock, ArrowUpRight, Command
} from "lucide-react";

interface CommandPaletteProps {
  onClose: () => void;
  onOpenVault: () => void;
}

type ActionItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  shortcut?: string;
  category: string;
  action?: () => void;
  color?: string;
};

export function CommandPalette({ onClose, onOpenVault }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ITEMS: ActionItem[] = [
    {
      id: "new-thread",
      icon: Plus,
      label: "New Thread",
      description: "Start a fresh execution session",
      shortcut: "N",
      category: "Quick Actions",
      color: "text-violet-400",
    },
    {
      id: "open-vault",
      icon: Archive,
      label: "Open Vault",
      description: "Access your private encrypted notes",
      shortcut: "V",
      category: "Quick Actions",
      color: "text-emerald-400",
      action: () => { onOpenVault(); onClose(); },
    },
    {
      id: "trajectory",
      icon: Compass,
      label: "Trajectory",
      description: "View your current execution path",
      category: "Navigation",
      color: "text-blue-400",
    },
    {
      id: "progress",
      icon: TrendingUp,
      label: "Progress",
      description: "Sprint metrics and momentum",
      category: "Navigation",
      color: "text-amber-400",
    },
    {
      id: "simulations",
      icon: Zap,
      label: "Simulations",
      description: "Monte Carlo path simulations",
      category: "Navigation",
      color: "text-pink-400",
    },
    {
      id: "docs",
      icon: FileText,
      label: "Documentation",
      description: "FP-OS reference and guides",
      category: "Resources",
      color: "text-text-secondary",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      description: "Customize your workspace",
      shortcut: ",",
      category: "Resources",
      color: "text-text-secondary",
    },
  ];

  const RECENT = [
    "Compress 90-day SaaS sprint",
    "First-principles: portfolio site",
    "Audit week 21 execution",
  ];

  const filtered = query.trim()
    ? ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : ITEMS;

  // Group by category
  const grouped = filtered.reduce<Record<string, ActionItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const allItems = Object.values(grouped).flat();

  const handleSelect = useCallback(
    (item: ActionItem) => {
      if (item.action) {
        item.action();
      } else {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, allItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (allItems[selected]) handleSelect(allItems[selected]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [allItems, selected, handleSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)" }}
      />

      {/* Palette panel */}
      <div
        className="relative w-full max-w-2xl animate-palette-in"
        style={{
          background: "linear-gradient(145deg, rgba(14,11,28,0.98) 0%, rgba(8,7,20,0.99) 100%)",
          border: "1px solid rgba(139,92,246,0.18)",
          borderRadius: "20px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.9), 0 8px 16px -4px rgba(0,0,0,0.6), 0 32px 80px -8px rgba(0,0,0,0.9), 0 0 60px -20px rgba(139,92,246,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-soft">
          <Search className="size-4 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, threads, pages…"
            className="flex-1 bg-transparent outline-none text-[15px] text-text-primary placeholder:text-text-tertiary"
          />
          <div className="flex items-center gap-1">
            <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border-soft bg-white/[0.04] text-text-tertiary tracking-wider">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto no-scrollbar p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-1">
              <div className="px-3 py-1.5 text-[10px] font-mono tracking-[0.2em] text-text-tertiary uppercase">
                {category}
              </div>
              {items.map((item) => {
                const idx = globalIndex++;
                const isSelected = idx === selected;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 cursor-pointer group ${
                      isSelected
                        ? "bg-violet-500/10 border border-violet-500/15"
                        : "hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${isSelected ? "bg-violet-500/15" : "bg-white/[0.04]"}`}>
                      <Icon className={`size-4 ${item.color ?? "text-text-secondary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary font-medium leading-tight">{item.label}</div>
                      {item.description && (
                        <div className="text-[11px] text-text-tertiary leading-tight mt-0.5 truncate">{item.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border-soft bg-white/[0.04] text-text-tertiary">
                          {item.shortcut}
                        </kbd>
                      )}
                      <ChevronRight className={`size-3.5 transition-all ${isSelected ? "text-violet-400 translate-x-0.5" : "text-text-tertiary opacity-0 group-hover:opacity-100"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Recent threads (only when no query) */}
          {!query.trim() && (
            <div className="mb-1">
              <div className="px-3 py-1.5 text-[10px] font-mono tracking-[0.2em] text-text-tertiary uppercase flex items-center gap-2">
                <Clock className="size-3" />
                Recent Threads
              </div>
              {RECENT.map((thread, i) => {
                const idx = globalIndex++;
                const isSelected = idx === selected;
                return (
                  <button
                    key={thread}
                    data-index={idx}
                    onMouseEnter={() => setSelected(idx)}
                    onClick={onClose}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-100 cursor-pointer group ${
                      isSelected ? "bg-violet-500/10 border border-violet-500/15" : "hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <div className="size-8 rounded-lg grid place-items-center shrink-0 bg-white/[0.04]">
                      <Clock className="size-3.5 text-text-tertiary" />
                    </div>
                    <span className="flex-1 text-sm text-text-secondary truncate">{thread}</span>
                    <ArrowUpRight className={`size-3.5 shrink-0 transition-all ${isSelected ? "text-violet-400" : "text-text-tertiary opacity-0 group-hover:opacity-100"}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Command className="size-8 text-text-tertiary mx-auto mb-3 opacity-40" />
              <p className="text-sm text-text-tertiary">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-soft font-mono text-[10px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded border border-border-soft bg-white/[0.04]">↑</kbd>
              <kbd className="px-1 rounded border border-border-soft bg-white/[0.04]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 rounded border border-border-soft bg-white/[0.04]">↵</kbd>
              Select
            </span>
          </div>
          <span className="tracking-widest">FP-OS · COMMAND</span>
        </div>
      </div>
    </div>
  );
}
