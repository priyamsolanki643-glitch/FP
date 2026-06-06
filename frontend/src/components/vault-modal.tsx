"use client";

import { useState, useEffect } from "react";
import {
  Lock, X, ArrowUpRight, TrendingUp, CheckCircle, XCircle, Folder, MessageCircle, MoreVertical, Trash, Share2
} from "lucide-react";

type TabId = "missions" | "mirror" | "debt" | "rival" | "market";

interface VaultModalProps {
  onClose: () => void;
}

const TABS: { id: TabId; label: string; num: string }[] = [
  { id: "missions", label: "Mission Folders", num: "1" },
  { id: "mirror",   label: "Reality Mirror",  num: "2" },
  { id: "debt",     label: "Execution Debt",  num: "3" },
  { id: "rival",    label: "Rival Index",     num: "4" },
  { id: "market",   label: "Market Analyser", num: "5" },
];

export function VaultModal({ onClose }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("missions");
  const [mounted, setMounted] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const switchTab = (id: TabId) => {
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(id);
      setTabTransition(false);
    }, 120);
  };

  const [globalMission, setGlobalMission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/interaction/active-mission`, {
          headers: { "Authorization": "Bearer test-user" }
        });
        const data = await res.json();
        if (data?.data && data.data.missionName) {
          const m = data.data;
          setGlobalMission({
            id: m.id,
            badge: "ACTIVE", tag: m.lockedPath,
            title: m.missionName,
            quote: m.mindsetBrief,
            path: m.strategyContent,
            day: m.dayNumber, total: m.totalDays, score: m.consistencyScore,
            time: "Live", unread: 0,
            fullStrategy: {
              goal: m.missionName,
              motivation: m.mindsetBrief,
              tasks: (m.strategyContent || "Phase 1 initialized.").split('\n').filter((l: string) => l.trim().length > 0),
              executionProtocol: "Refer to the strategy content."
            }
          });
        }
      } catch (err) {
        console.error("Failed to load active mission", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMission();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop with enhanced blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(20px) saturate(120%)",
          WebkitBackdropFilter: "blur(20px) saturate(120%)",
        }}
      />

      {/* Modal Container — gradient border + deep shadow */}
      <div
        className={`relative w-full max-w-[1100px] h-[88vh] flex flex-col rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-[400ms] ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-6 scale-[0.97]"
        }`}
        style={{
          background: "#000000",

          boxShadow: "0 0 0 1px rgba(0,0,0,0.8), 0 25px 80px -12px rgba(0,0,0,0.85), 0 0 60px rgba(0,0,0,0.4)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Top Bar */}
        <div className="flex items-center justify-between px-5 md:px-6 h-14 shrink-0" style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="flex items-center gap-3">
            <div
              className="size-[22px] rounded-[6px] grid place-items-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Lock className="size-3 text-[#71717a]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-white tracking-tight">The Vault</span>
            </div>
            <span className="text-[#27272a] text-sm ml-1 hidden sm:inline">—</span>
            <span className="text-[13px] text-[#52525b] ml-1 hidden sm:inline transition-opacity duration-200">
              {activeTab === "missions" && "Locked paths."}
              {activeTab === "mirror" && "Behavioural truth."}
              {activeTab === "debt" && "Cost of inconsistency."}
              {activeTab === "rival" && "Anonymous. Unforgiving."}
              {activeTab === "market" && "Your window. Live."}
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center rounded-lg text-[#52525b] hover:text-[#a1a1aa] transition-all cursor-pointer"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        {/* Tab Bar with animated underline */}
        <div className="flex items-center gap-1 px-4 md:px-6 h-[46px] shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`relative flex items-center gap-2 px-3 h-full transition-colors duration-150 cursor-pointer ${
                  active ? "text-white" : "text-[#52525b] hover:text-[#a1a1aa]"
                }`}
              >
                <span className="text-[13px] font-medium whitespace-nowrap">{tab.label}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-150"
                  style={{
                    background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    color: active ? "#d4d4d8" : "#3f3f46",
                  }}
                >
                  {tab.num}
                </span>
                {/* Animated underline */}
                {active && (
                  <div
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-white"
                    style={{ animation: "tab-underline 200ms cubic-bezier(0.16,1,0.3,1) forwards" }}
                  />
                )}
              </button>
            );
          })}
          <style>{`@keyframes tab-underline { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }`}</style>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative" style={{ background: "#000000" }}>
          {/* Faint dot grid — Vercel-inspired */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.025,
              backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />
          
          <div
            className="relative z-10 px-5 md:px-8 py-8 md:py-10 max-w-[900px] mx-auto min-h-full transition-opacity duration-150"
            style={{ opacity: tabTransition ? 0 : 1 }}
          >
            {/* Tab Header inside content */}
            <div className="flex justify-between items-end mb-8 md:mb-10">
              <div>
                <div className="text-[10px] text-[#3f3f46] font-mono tracking-[0.2em] mb-2">
                  0{TABS.find(t => t.id === activeTab)?.num} / 5
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
              </div>
              <div className="text-[13px] text-[#52525b] hidden md:block">
                {activeTab === "missions" && "Locked paths."}
                {activeTab === "mirror" && "Behavioural truth."}
                {activeTab === "debt" && "Cost of inconsistency."}
                {activeTab === "rival" && "Anonymous. Unforgiving."}
                {activeTab === "market" && "Your window. Live."}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-[300px] text-[#52525b]">Loading...</div>
            ) : !globalMission ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
                <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Folder className="size-6 text-[#52525b]" />
                </div>
                <h3 className="text-white font-medium text-lg mb-2">No active missions</h3>
                <p className="text-[#a1a1aa] text-[13px] max-w-[280px]">
                  Start chatting with the Strategist to initialize your first mission protocol.
                </p>
              </div>
            ) : (
              <>
                {activeTab === "missions" && <TabMissions onClose={onClose} globalMission={globalMission} />}
                {activeTab === "mirror" && <TabMirror />}
                {activeTab === "debt" && <TabDebt />}
                {activeTab === "rival" && <TabRival />}
                {activeTab === "market" && <TabMarket />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabMissions({ onClose, globalMission }: { onClose: () => void, globalMission: any }) {
  const [missions, setMissions] = useState<any[]>([globalMission]);
  const [activeMission, setActiveMission] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMissions(missions.filter(m => m.id !== id));
    setMenuOpenId(null);
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'FP Strategy',
        text: 'Check out this strategy plan',
      }).catch(console.error);
    } else {
      alert("Sharing options opened.");
    }
    setMenuOpenId(null);
  };

  if (activeMission) {
    return (
      <div className="h-[500px] flex flex-col relative bg-[#0a0a0c] rounded-3xl overflow-hidden animate-scale-in">
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 left-0 right-0 z-10 bg-[#0a0a0c]/90 backdrop-blur-md px-6 md:px-8 py-4 border-b border-white/5 flex items-center justify-between">
          <button 
            onClick={() => setActiveMission(null)} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-medium transition-colors cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Back to Folders
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">{activeMission.title}</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-[#a1a1aa] tracking-widest rounded px-2 py-0.5 bg-[#18181b]">{activeMission.badge}</span>
                <span className="text-[11px] font-mono text-[#52525b]">{activeMission.tag}</span>
              </div>
            </div>
          </div>

        <p className="text-[14px] text-[#a1a1aa] leading-relaxed italic mb-8 border-l-2 border-[#27272a] pl-4">
          "{activeMission.quote}"
        </p>
        
        <div className="bg-[#121214] rounded-2xl p-6 text-[#d4d4d8] text-[14.5px] leading-relaxed flex-1 overflow-y-auto no-scrollbar shadow-inner">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#22c55e] mb-6 tracking-widest uppercase">
            <Lock className="size-3" /> Locked Strategy Path
          </div>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-2 pb-1 inline-block">Primary Goal</h4>
              <p className="text-white font-medium mt-1">{activeMission.fullStrategy?.goal || activeMission.title}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-2 pb-1 inline-block">Motivation & Mindset</h4>
              <p className="text-[#d4d4d8] mt-1">"{activeMission.fullStrategy?.motivation || activeMission.quote}"</p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-3 pb-1 inline-block">Core Tasks</h4>
              <ul className="space-y-2.5">
                {activeMission.fullStrategy?.tasks?.map((task: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-[#22c55e] shrink-0 font-mono text-[10px] mt-1">0{idx + 1}</span>
                    <span className="text-[#d4d4d8]">{task}</span>
                  </li>
                ))}
                {!activeMission.fullStrategy?.tasks && <p>{activeMission.path}</p>}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest mb-3 pb-1 inline-block">Execution Protocol</h4>
              <div className="text-[#d4d4d8] whitespace-pre-wrap leading-loose">
                {activeMission.fullStrategy?.executionProtocol || "No protocol assigned."}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 flex justify-between items-center text-[11px] font-mono text-[#666]">
            <span>DAY {activeMission.day} / {activeMission.total}</span>
            <span className="text-white bg-white/5 px-3 py-1 rounded-full">SCORE {activeMission.score}/100</span>
          </div>
        </div>
        </div>

        {/* Floating Chat Icon */}
        <button 
          className="absolute bottom-6 right-6 size-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-transform cursor-pointer z-10"
          onClick={() => {
            onClose();
          }}
          title="Return to Strategy Chat"
        >
          <MessageCircle className="size-6 fill-black" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Folder className="size-6 text-[#52525b]" />
          </div>
          <h3 className="text-white font-medium text-lg mb-2">No active missions</h3>
          <p className="text-[#a1a1aa] text-[13px] max-w-[280px]">
            Start chatting with the Strategist to initialize your first mission protocol.
          </p>
        </div>
      ) : (
        missions.map(m => (
          <div 
            key={m.id} 
            onClick={() => setActiveMission(m)}
            className="flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-[#121214] transition-colors cursor-pointer group relative border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4 overflow-hidden flex-1">
              <div className="size-11 md:size-12 rounded-full bg-[#18181b] flex items-center justify-center shrink-0 shadow-sm relative">
                <Folder className="size-5 text-[#888888]" />
                {m.unread > 0 && (
                  <div className="absolute -top-1 -right-1 size-[18px] rounded-full bg-[#22c55e] flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#000000]">
                    {m.unread}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[15px] font-medium text-[#e3e3e3] truncate tracking-tight">{m.title}</span>
                <span className="text-[13px] text-[#666666] truncate mt-0.5 max-w-[280px] md:max-w-[400px]">
                  {m.quote}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
              <span className={`text-[11px] font-medium ${m.unread > 0 ? 'text-[#22c55e]' : 'text-[#52525b]'}`}>{m.time}</span>
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === m.id ? null : m.id);
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-[#52525b] hover:text-white transition-colors cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                </button>

                {menuOpenId === m.id && (
                  <div className="absolute right-0 top-full mt-1 w-[140px] bg-[#1e1f20] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 animate-scale-in origin-top-right">
                    <button 
                      onClick={(e) => handleShare(m.id, e)}
                      className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-[#d4d4d8] hover:bg-white/5 hover:text-white flex items-center gap-2.5 cursor-pointer"
                    >
                      <Share2 className="size-3.5" /> Share
                    </button>
                    <button 
                      onClick={(e) => handleDelete(m.id, e)}
                      className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2.5 mt-0.5 cursor-pointer"
                    >
                      <Trash className="size-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TabMirror() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Graph Area */}
      <div className="rounded-2xl bg-[#000000] p-6 flex flex-col justify-between row-span-2">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-2">CONSISTENCY · 30 DAYS</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-medium text-white tracking-tight">49</span>
                <span className="text-sm font-mono text-[#52525b]">-13 pts</span>
              </div>
            </div>
            <div className="border border-red-500/20 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-md font-mono text-[9px] tracking-widest uppercase">
              Bhai kya ho raha hai — yeh wala tu nahi hai
            </div>
          </div>

          <div className="h-[200px] w-full mt-8 relative">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible preserve-aspect-ratio-none">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q20,15 40,20 T80,25 T100,30 L100,40 L0,40 Z" fill="url(#g)" />
              <path d="M0,25 Q20,15 40,20 T80,25 T100,30" fill="none" stroke="#4ade80" strokeWidth="0.5" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2 text-[10px] font-mono text-[#52525b]">
              <span>D5</span><span>D9</span><span>D13</span><span>D17</span><span>D21</span><span>D25</span><span>D29</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-[#18181b] rounded-xl p-4 text-[13px] text-[#a1a1aa] mb-4">
            Yeh numbers teri puri story nahi hain. Day 0 pe tu yahan tha — aaj yahan hai. Direction fix kar.
          </div>
          <div className="text-[10px] font-mono text-[#52525b]">
            This insight is based on your self-reported data and chat history within FP only.
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-2xl bg-[#000000] p-6 h-fit">
        <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-4">BEHAVIOURAL INSIGHT</div>
        <p className="text-[14px] text-white leading-relaxed">
          Tu highly specialized hai — teri problem-solving speed <span className="font-semibold">top 15%</span> hai. Lekin execution windows mein tu disappear ho jaata hai. Yeh teri sabse badi bottleneck hai.
        </p>
      </div>

      {/* Pros & Cons */}
      <div className="rounded-2xl bg-[#000000] p-6 grid grid-cols-2 gap-8 h-fit">
        <div>
          <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-4">EDGES</div>
          <ul className="space-y-4">
            <li className="flex gap-3 text-[13px] text-white"><CheckCircle className="size-4 text-[#4ade80] shrink-0" /> Top 15% raw IQ in domain</li>
            <li className="flex gap-3 text-[13px] text-white"><CheckCircle className="size-4 text-[#4ade80] shrink-0" /> Pattern recognition above peers</li>
            <li className="flex gap-3 text-[13px] text-white"><CheckCircle className="size-4 text-[#4ade80] shrink-0" /> Builds fast under deadline</li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-4">LEAKS</div>
          <ul className="space-y-4">
            <li className="flex gap-3 text-[13px] text-[#a1a1aa]"><XCircle className="size-4 text-red-500 shrink-0" /> Vanishes in 5-7 day execution gaps</li>
            <li className="flex gap-3 text-[13px] text-[#a1a1aa]"><XCircle className="size-4 text-red-500 shrink-0" /> Optimizes inputs, avoids shipping</li>
            <li className="flex gap-3 text-[13px] text-[#a1a1aa]"><XCircle className="size-4 text-red-500 shrink-0" /> No public commitments → low debt cost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TabDebt() {
  return (
    <div className="space-y-4">
      {/* 3 Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consistency */}
        <div className="rounded-2xl bg-[#000000] p-8 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-6 px-3 py-1 rounded bg-[#18181b]">CONSISTENCY SCORE</div>
          <div className="relative size-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#18181b" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="283" strokeDashoffset="93" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-white">67</span>
              <span className="text-[10px] font-mono text-[#52525b]">/100</span>
            </div>
          </div>
        </div>

        {/* Debt Days */}
        <div className="rounded-2xl bg-[#000000] p-8 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono text-[#ef4444] tracking-widest mb-6 border border-[#ef4444]/20 px-3 py-1 rounded bg-[#ef4444]/5">DEBT DAYS</div>
          <div className="relative size-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#18181b" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="283" strokeDashoffset="240" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-white">4</span>
              <span className="text-[10px] font-mono text-[#52525b]">DAYS</span>
            </div>
          </div>
        </div>

        {/* Days to Goal */}
        <div className="rounded-2xl bg-[#000000] p-8 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-6 px-3 py-1 rounded bg-[#18181b]">DAYS TO GOAL</div>
          <div className="relative size-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#18181b" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="283" strokeDashoffset="141" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-white">89</span>
              <span className="text-[10px] font-mono text-[#52525b]">DAYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Impact Block */}
      <div className="rounded-2xl bg-red-500/5 p-6">
        <div className="text-[10px] font-mono text-red-500 tracking-widest mb-4 px-2 py-1 rounded w-fit">DEBT IMPACT</div>
        <p className="text-[14px] text-white leading-relaxed">
          In <span className="text-red-500 font-medium">4 dinon</span> mein teri competition ne 4 tasks complete kiye. Market window 6 weeks thi — ab 5.3 weeks hai. Tu wahan khada hai jahan tha — duniya aage nikal gayi.
        </p>
      </div>

      <div className="rounded-2xl bg-[#000000] p-6 text-[10px] font-mono text-[#52525b]">
        CONSISTENCY WIN · 12 DAY STREAK
      </div>
    </div>
  );
}

function TabRival() {
  return (
    <div className="rounded-3xl bg-[#000000] p-10 flex flex-col md:flex-row gap-12 relative overflow-hidden h-[400px]">
      {/* Background stars/dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 size-1 bg-white rounded-full opacity-20 blur-[1px]" />
        <div className="absolute top-1/2 right-1/3 size-1.5 bg-[#facc15] rounded-full opacity-30 blur-[2px]" />
        <div className="absolute bottom-1/3 right-1/5 size-1 bg-white rounded-full opacity-10" />
      </div>

      {/* Left side text */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-mono text-[#52525b] tracking-widest mb-8 rounded px-3 py-1 bg-[#18181b] w-fit">
          ANONYMOUS COHORT
        </div>
        
        <h3 className="text-3xl text-white font-medium leading-snug mb-8 max-w-[400px]">
          Tere jaisa <span className="text-[#a1a1aa]">847</span> log same goal pe hain. <br/>
          <span className="text-[#a1a1aa]">23</span> already milestone cross kar gaye. <br/>
          <span className="text-[#52525b]">Tu kahan hai?</span>
        </h3>

        <div className="text-[9px] font-mono text-[#3f3f46] tracking-[0.2em] uppercase mt-auto">
          NO NAMES - NO PERSONAL DATA - AGGREGATED WEEKLY
        </div>
      </div>

      {/* Right side stats */}
      <div className="w-[300px] grid grid-cols-2 gap-4 shrink-0 h-fit self-center z-10">
        <div className="bg-[#000] p-5 rounded-2xl">
          <div className="text-[9px] font-mono text-[#52525b] tracking-widest mb-2 uppercase">Same goal</div>
          <div className="text-3xl text-white font-medium">847</div>
        </div>
        <div className="bg-[#000] p-5 rounded-2xl">
          <div className="text-[9px] font-mono text-[#52525b] tracking-widest mb-2 uppercase">Crossed</div>
          <div className="text-3xl text-white font-medium">23</div>
        </div>
        <div className="bg-[#000] p-5 rounded-2xl">
          <div className="text-[9px] font-mono text-[#52525b] tracking-widest mb-2 uppercase">Active 7d</div>
          <div className="text-3xl text-white font-medium">612</div>
        </div>
        <div className="bg-[#000] p-5 rounded-2xl">
          <div className="text-[9px] font-mono text-[#52525b] tracking-widest mb-2 uppercase">Your rank</div>
          <div className="text-3xl text-white font-medium">#347</div>
        </div>
      </div>
    </div>
  );
}

function TabMarket() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Live Market */}
      <div className="rounded-2xl bg-[#000000] p-6 h-full min-h-[340px] flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 bg-[#18181b] rounded px-2 py-1">
            <div className="size-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] font-mono text-white tracking-widest uppercase">LIVE</span>
          </div>
          <TrendingUp className="size-4 text-[#52525b]" />
        </div>

        <h3 className="text-xl text-white font-medium mb-1">Your Market · Live</h3>
        <p className="text-[13px] text-[#52525b] mb-6">Teri city mein aaj:</p>

        <ul className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
          <li className="flex items-center gap-3 bg-[#000] p-3 rounded-xl">
            <div className="size-5 rounded grid place-items-center text-[10px] text-[#52525b] shrink-0">↗</div>
            <p className="text-[12px] text-[#a1a1aa] leading-tight flex-1">4 businesses ne automation tools adopt kiye</p>
            <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest shrink-0">TODAY</span>
          </li>
          <li className="flex items-center gap-3 bg-[#000] p-3 rounded-xl">
            <div className="size-5 rounded grid place-items-center text-[10px] text-[#52525b] shrink-0">~</div>
            <p className="text-[12px] text-[#a1a1aa] leading-tight flex-1">WhatsApp CRM demand</p>
            <span className="text-[10px] font-mono text-green-400 shrink-0">+31% THIS WEEK</span>
          </li>
          <li className="flex items-center gap-3 bg-[#000] p-3 rounded-xl">
            <div className="size-5 rounded grid place-items-center text-[10px] text-[#52525b] shrink-0">↘</div>
            <p className="text-[12px] text-[#a1a1aa] leading-tight flex-1">Active competitors in your niche</p>
            <span className="text-[10px] font-mono text-[#52525b] shrink-0 text-white font-semibold">12 NOW</span>
          </li>
        </ul>
      </div>

      {/* Window Alert */}
      <div className="rounded-2xl bg-[#000000] p-6 h-full min-h-[340px] flex flex-col justify-center">
        <div className="text-[9px] font-mono text-[#a1a1aa] tracking-widest mb-6 bg-[#18181b] rounded px-3 py-1 w-fit">
          ⌛ WINDOW ALERT
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-6xl text-white font-medium tracking-tight">3.5</span>
          <span className="text-[11px] font-mono text-[#52525b] tracking-widest uppercase">WEEKS LEFT</span>
        </div>

        <div className="h-1 bg-[#18181b] w-full rounded-full mb-8">
          <div className="h-full bg-red-500 w-[60%] rounded-full" />
        </div>

        <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
          Teri opportunity window: 3.5 weeks baaki. Iske baad market saturate ho jayega. Jo aaj execute karega — woh market ka pehla mover hoga.
        </p>
      </div>

      {/* Category Movers */}
      <div className="rounded-2xl bg-[#000000] p-6 h-full min-h-[340px] flex flex-col">
        <div className="text-[9px] font-mono text-[#52525b] tracking-widest mb-6 uppercase rounded px-2 py-1 w-fit">
          CATEGORY MOVERS
        </div>

        <h3 className="text-lg text-white font-medium mb-8">Teri category mein is hafte</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-xl bg-[#000]">
            <span className="text-[12px] text-[#52525b]">Top performer</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-white font-medium">3</span>
              <span className="text-[9px] font-mono text-[#52525b] tracking-widest uppercase">CLIENTS CLOSED</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center border border-[#18181b] p-4 rounded-xl bg-[#000]">
            <span className="text-[12px] text-[#52525b]">Average executor</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-white font-medium">0.4</span>
              <span className="text-[9px] font-mono text-[#52525b] tracking-widest uppercase">CLIENTS</span>
            </div>
          </div>

          <div className="flex justify-between items-center border border-[#18181b] p-4 rounded-xl bg-[#000]">
            <span className="text-[12px] text-[#52525b]">Tu</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-red-500 font-medium">??</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ego Attack Banner */}
      <div className="md:col-span-3 rounded-xl bg-red-500/5 p-4 flex gap-4 items-center mt-2">
        <div className="text-[10px] font-mono text-red-500 tracking-widest px-2 py-1 rounded bg-[#000] shrink-0">
          EGO ATTACK
        </div>
        <p className="text-[13px] text-white">
          Market tera wait nahi kar raha. Har din jo tu ghost rehta hai — koi aur teri jagah le raha hai.
        </p>
      </div>
    </div>
  );
}
