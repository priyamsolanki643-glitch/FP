"use client";

import { useState, useEffect } from "react";
import {
  Lock, X, TrendingUp, CheckCircle, Target, ArrowRight, Trophy, AlertTriangle, Radio, ChevronLeft, FileText, Download, Share2, HelpCircle
} from "lucide-react";

type TabId = "missions" | "mirror" | "debt" | "rival" | "market";

interface VaultModalProps {
  onClose: () => void;
}

interface MissionData {
  id?: number;
  missionName?: string;
  mindsetBrief?: string;
  coreStrategy?: string;
  strategyContent?: string;
  lockedPath?: string;
  dayNumber?: number;
  totalDays?: number;
  consistencyScore?: number;
  debtDays?: number;
  daysToGoal?: number;
  streakDays?: number;
}

interface MirrorData {
  trend?: string;
  history?: number[];
  insight?: string;
  strengths?: string[];
  bottlenecks?: string[];
}

interface RivalData {
  totalUsers?: number;
  milestonePassedUsers?: number;
  category?: string;
}

interface MarketSignal {
  skillName?: string;
  demandLevel?: string;
  name?: string;
  trend?: string;
}

interface MarketGap {
  gapDescription?: string;
  opportunitySize?: string;
}

interface MarketData {
  skillDemandSignals?: MarketSignal[];
  localMarketGaps?: MarketGap[];
  timingSignals?: { timeframe: string; urgency: string }[];
  topInsight?: string;
}

interface VaultData {
  mission?: MissionData;
  mirror?: MirrorData;
  market?: MarketData;
  rival?: RivalData;
}

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { 
    id: "missions", 
    label: "Missions", 
    icon: Target,
    desc: "Active directives issued by Lumensky AI."
  },
  { 
    id: "mirror",   
    label: "Reality Mirror", 
    icon: TrendingUp,
    desc: "Unfiltered diagnosis of your execution patterns, weaknesses, and weekly consistency trends."
  },
  { 
    id: "debt",     
    label: "Execution Debt", 
    icon: AlertTriangle,
    desc: "Visualizes missed tasks and backlog compounding. Clear debt to maintain progress."
  },
  { 
    id: "rival",    
    label: "Rival Index", 
    icon: Trophy,
    desc: "Anonymous, live comparison against top-performing candidates targeting the same goals."
  },
  { 
    id: "market",   
    label: "Market Analyser", 
    icon: Radio,
    desc: "Live external data feed of test trends, syllabus weightage, and critical timing signals."
  },
];

export function VaultModal({ onClose }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("missions");
  const [mounted, setMounted] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    const fetchVaultData = async () => {
      setLoading(true);
      try {
        const { supabase } = await import('@/utils/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || "test-user";
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const headers = { "Authorization": `Bearer ${token}` };

        const [missionRes, mirrorRes, marketRes, rivalRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/interaction/active-mission`, { headers }),
          fetch(`${baseUrl}/api/v1/interaction/reality-mirror`, { headers }),
          fetch(`${baseUrl}/api/v1/interaction/market-report`, { headers }),
          fetch(`${baseUrl}/api/v1/interaction/rival-index`, { headers })
        ]);

        const [mission, mirror, market, rival] = await Promise.all([
          missionRes.json().catch(()=>({data:null})),
          mirrorRes.json().catch(()=>({data:null})),
          marketRes.json().catch(()=>({data:null})),
          rivalRes.json().catch(()=>({data:null}))
        ]);

        setVaultData({
          mission: mission?.data,
          mirror: mirror?.data,
          market: market?.data,
          rival: rival?.data
        });
      } catch(e) {
        console.error("Vault data fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVaultData();
  }, []);

  const switchTab = (id: TabId) => {
    if (id === activeTab) return;
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(id);
      setTabTransition(false);
    }, 150);
  };

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop with click-to-close */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[1100px] h-[92vh] sm:h-[88vh] flex flex-col rounded-2xl md:rounded-[24px] overflow-hidden transition-all duration-[400ms] glass-vault ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Futuristic grid overlay background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", 
            backgroundSize: "48px 48px" 
          }} 
        />
        
        {/* Header Section: Replaced mb-10 with compact layout for mobile */}
        <div className="relative z-20 px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 md:pt-8 pb-4 border-b border-white/5 flex flex-col bg-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-8 sm:size-9 rounded-[8px] border border-red-500/30 flex items-center justify-center bg-red-500/10 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <Lock className="size-3.5 text-red-500" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-red-500 tracking-[0.22em] uppercase mb-0.5 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE DEMO PROJECTION
                </div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  THE VAULT <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">Rahul M.</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Tabs Wrapper with subtle indicator fade */}
          <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar pb-1">
            <div className="flex gap-1.5 md:gap-2">
              {TABS.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.97] ${
                      activeTab === tab.id 
                        ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                        : 'text-[#a1a1aa] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <TabIcon className="size-3.5 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Description Context Header: Tells user what this tab does */}
        {activeTabMeta && (
          <div className="px-4 sm:px-6 md:px-10 py-3 glass-card border-b border-white/5 border-t-0 border-x-0 rounded-none flex items-start gap-2.5 relative z-15">
            <HelpCircle className="size-4 text-[#71717a] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-[#a1a1aa] leading-snug">
              <strong className="text-white uppercase font-mono mr-1">{activeTabMeta.label}:</strong> 
              {activeTabMeta.desc}
            </p>
          </div>
        )}

        {/* Main Content Scroll Area */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <div 
            className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 w-full transition-opacity duration-150"
            style={{ opacity: tabTransition ? 0 : 1 }}
          >
            {loading ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3">
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase">Decrypting Logs...</span>
              </div>
            ) : (
              <div className="w-full max-w-5xl mx-auto">
                {activeTab === "missions" && <TabMissions missionData={vaultData?.mission} />}
                {activeTab === "mirror" && <TabMirror mirrorData={vaultData?.mirror} />}
                {activeTab === "debt" && <TabDebt missionData={vaultData?.mission} />}
                {activeTab === "rival" && <TabRival rivalData={vaultData?.rival} />}
                {activeTab === "market" && <TabMarket marketData={vaultData?.market} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabMissions({ missionData }: { missionData?: MissionData }) {
  const [activeMission, setActiveMission] = useState<MissionData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleShare = () => {
    if (!activeMission) return;
    const text = `MISSION: ${activeMission.title}\nSTRATEGY: ${activeMission.strategy}\n\nPROTOCOL:\n${activeMission.protocol.join('\n')}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeMission) return;
    const text = `CONFIDENTIAL PROTOCOL\nID: MS-${activeMission.id}00X9\nTITLE: ${activeMission.title}\n\nMINDSET BRIEF:\n${activeMission.quote}\n\nCORE STRATEGY:\n${activeMission.strategy}\n\nEXECUTION PROTOCOL:\n${activeMission.protocol.join('\n')}\n\nSTATUS: Day ${activeMission.day} of ${activeMission.total} (${activeMission.consistency}% Consistency)`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Protocol_${activeMission.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  const parseProtocol = (strategyText: string | undefined, lockedPath: string | undefined) => {
    if (!strategyText) {
      return [
        "LOCKED PATH: " + (lockedPath || "Alpha"),
        "- Follow the daily execution mandate generated for you.",
        "- Missing a daily checkpoint incurs execution debt.",
        "- Do not attempt to optimize the system. Submit to it."
      ];
    }
    return strategyText.split('\n').filter((line: string) => line.trim() !== '');
  };

  const missions = missionData ? [
    {
      id: 1,
      title: missionData.missionName || "Active Mission",
      quote: missionData.mindsetBrief || "Tu average nahi hai. Execute kar.",
      strategy: missionData.coreStrategy || "Follow the locked path. Execute daily targets without fail.",
      protocol: parseProtocol(missionData.strategyContent, missionData.lockedPath),
      day: missionData.dayNumber || 1,
      total: missionData.totalDays || 90,
      consistency: missionData.consistencyScore || 0
    }
  ] : [
    {
      id: 1,
      title: "Operation: Zero Budget Surgical Strike",
      quote: "Bhai, paise nahi hain toh kya hua? Tera execution teri sabse badi funding hai. Rona band kar aur execute kar.",
      strategy: "Maine tera poora syllabus scan kar liya hai. Koi naya paid batch lene ki zaroorat nahi hai. Tera course PW Manzil Foundation ke free YouTube lectures aur open-source PDF se 100% map ho chuka hai. Bas chup-chaap ise follow kar.",
      protocol: [
        "LOCKED PATH: Free Access Protocol",
        "- 09:00 AM: PW Manzil Lecture (Physics) - 2x speed pe nahi dekhna hai, properly notes bana.",
        "- 12:00 PM: Sirf NCERT back-exercises solve kar. Koi faltu reference book mat choona.",
        "- 03:00 PM: NTA Abhyas App pe free chapter-wise mock test de aur apni aukaat check kar."
      ],
      day: 4, total: 14, consistency: 85
    },
    {
      id: 2,
      title: "The 4.5 Hour Aggression Plan",
      quote: "4.5 ghante mein syllabus khatam nahi hota, par rank zaroor nikal sakti hai agar tu 'donkey-work' na kare.",
      strategy: "Tere paas time kam hai, isliye maine tere curriculum se 65% heavy math chapters temporarily block kar diye hain. Ab tu sirf High-Yield/Low-Effort topics (jaise Inorganic Chem aur Modern Physics) pe focus karega. Hamein marks chahiye, scholar nahi banna hai.",
      protocol: [
        "LOCKED PATH: High-Yield Strike",
        "- Focus Area 1: Modern Physics (Yahan se 3 questions guarantee aayenge).",
        "- Focus Area 2: Block Chemistry (Ratna padega, but 2 questions fix hain).",
        "- Blocked: Integration & Conic Sections (Isme time waste nahi karna hai, isko chhod de)."
      ],
      day: 1, total: 14, consistency: 42
    },
    {
      id: 3,
      title: "The 14-Day Ruthless Sprint",
      quote: "Bhai 2 saal ka lamba plan bhool ja. Tu 3 din lagataar padh nahi paata. Aaj ka din jeet.",
      strategy: "Tera long-term planning system completely toot chuka hai. Ab hum sirf 14 din ke micro-sprints khelenge. Tu sirf agle 25 minute ke baare mein sochega. Pomodoro technique on kar aur duniya bhool ja.",
      protocol: [
        "LOCKED PATH: Consistency Rehab",
        "- Subah uthte hi seedha phone side rakh aur pehla 25-min Pomodoro execute kar.",
        "- Agar koi task miss ho gaya, toh guilt mein mat beth. Rone se kuch nahi hoga, turant agla Pomodoro start kar.",
        "- Din ke 10 Pomodoro (4.5 hours) hit karne hain, chahe aasmaan gir jaye."
      ],
      day: 2, total: 14, consistency: 60
    }
  ];

  if (activeMission) {
    return (
      <div className="w-full glass-card rounded-2xl flex flex-col overflow-hidden animate-fade-in relative group">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        {/* Toolbar: Responsive buttons */}
        <div className="h-12 bg-[#121212] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          <button 
            onClick={() => setActiveMission(null)}
            className="flex items-center gap-1 text-[#a1a1aa] hover:text-white transition-colors text-xs font-semibold"
          >
            <ChevronLeft className="size-4" /> Folders
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-[10px] font-mono tracking-widest uppercase ${
                isCopied ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              {isCopied ? <CheckCircle className="size-3" /> : <Share2 className="size-3" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Share'}</span>
            </button>
            <button 
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-[10px] font-mono tracking-widest uppercase ${
                isDownloaded ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
              }`}
            >
              {isDownloaded ? <CheckCircle className="size-3" /> : <Download className="size-3" />}
              <span className="hidden sm:inline">{isDownloaded ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Document Content: Responsive paddings */}
        <div className="px-5 sm:px-8 md:px-12 py-8 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Folder Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <FileText className="size-4 text-white/80" />
                  </div>
                  <div>
                    <div className="text-[8px] font-mono text-[#71717a] tracking-[0.2em] uppercase">Sealed Plan</div>
                    <div className="text-[11px] font-mono text-[#a1a1aa]">ID: MS-{activeMission.id}00X9</div>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {activeMission.title}
                </h1>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />

            {/* Mindset Quote */}
            <div className="border-l-[2px] border-white/20 pl-4 py-1.5">
              <div className="text-[9px] font-mono text-[#71717a] tracking-[0.2em] uppercase mb-1">Mindset Prompt</div>
              <p className="text-[13px] sm:text-[15px] font-medium text-white/90 leading-relaxed italic">
                &quot;{activeMission.quote}&quot;
              </p>
            </div>

            {/* Core Strategy */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-5 relative overflow-hidden">
              <div className="text-[9px] font-mono text-[#71717a] tracking-[0.2em] uppercase mb-2 flex items-center gap-1.5">
                <Target className="size-3 text-white/70" /> Core Strategy
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[#d4d4d8]">
                {activeMission.strategy}
              </p>
            </div>

            {/* Detailed Execution Protocol */}
            <div>
              <div className="text-[9px] font-mono text-[#71717a] tracking-[0.2em] uppercase mb-3 flex items-center gap-1.5">
                <Lock className="size-3 text-white/70" /> Daily Directives
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-[#a1a1aa] leading-relaxed bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
                {activeMission.protocol.map((line: string, i: number) => {
                  const isHeader = line.includes(':') && !line.startsWith('-');
                  return (
                    <div key={i} className={isHeader ? "text-white font-bold pt-2 first:pt-0" : "pl-3 hover:text-white transition-colors cursor-default"}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest block mb-0.5">Timeline Progress</span>
                <span className="text-white font-semibold">Day {activeMission.day} of {activeMission.total}</span>
              </div>
              <div className="px-3 py-1.5 bg-[#ffffff]/10 text-white border border-[#ffffff]/20 rounded-md text-[10px] font-mono uppercase tracking-[0.05em] flex items-center gap-2 w-fit">
                <div className="size-1.5 rounded-full bg-white animate-pulse" />
                {activeMission.consistency}% Consistency Matrix
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in w-full">
      {missions.length === 0 ? (
        <div className="glass-card rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center">
          <Target className="size-10 text-[#52525b] mb-4" />
          <h3 className="text-sm font-bold text-white mb-1">No Active Missions</h3>
          <p className="text-xs text-[#71717a] max-w-[280px]">Initiate diagnostic check in chat workspace to launch a path.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {missions.map((m, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveMission(m)}
              className="group flex items-center justify-between glass-card rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Target className="size-5 text-white/70 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none mb-1.5">{m.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider">
                    <span>Day {m.day}/{m.total}</span>
                    <span className="size-1 rounded-full bg-white/20" />
                    <span className={m.consistency >= 85 ? 'text-white font-bold' : m.consistency >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                      {m.consistency}% Acc.
                    </span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-[#52525b] group-hover:text-white transition-colors pl-2">
                <ArrowRight className="size-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabMirror({ mirrorData }: { mirrorData?: MirrorData }) {
  const isTrendUp = false;
  const score = 10;
  
  const data = mirrorData?.history ? [...mirrorData.history] : [85, 70, 42, 60, 30, 45, 10];
  if (data.length > 0) data[data.length - 1] = 10; // Force last bar to crash to 10
  while(data.length < 7) { data.unshift(data.length > 0 ? data[0] : 50); }
  const graphData = data.slice(-7);

  const insight = mirrorData?.insight || "Bhai, weekend aate hi teri consistency 45% gir jaati hai. Tu mock tests dene se darr raha hai kyunki tujhe reality face nahi karni.";
  const strengths = mirrorData?.strengths || ["Physics theory mein tera execution rate solid hai", "Ek din miss karne ke baad tera bounce-back speed badhiya hai"];
  const bottlenecks = mirrorData?.bottlenecks || ["Jab time kam hota hai, tu Math ko bilkul touch nahi karta", "Weekend aate hi Reels scroll karne mein dopamine drain ho raha hai"];
  
  if (!mirrorData && false) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-[#52525b] text-xs font-mono tracking-widest uppercase">No execution data recorded yet</div>
        <div className="text-[#3f3f46] text-[11px] max-w-xs leading-relaxed">Start executing your daily targets. FP will build your consistency graph automatically.</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <div className="text-[9px] font-mono text-[#71717a] tracking-[0.2em] uppercase mb-1">Consistency Metric (7-Week Trend)</div>
            <div className="text-3xl sm:text-5xl font-extrabold text-white flex items-baseline gap-1.5 tracking-tight">
              {score} <span className="text-sm sm:text-lg text-[#52525b] font-medium tracking-normal">/ 100</span>
            </div>
          </div>
          
          <div className={`px-2.5 py-1 border rounded text-[9px] font-mono tracking-[0.1em] uppercase flex items-center gap-1.5 w-fit ${
            isTrendUp ? 'border-white/20 text-white bg-white/[0.02]' : 'border-red-500/20 text-red-500 bg-red-500/5'
          }`}>
            {isTrendUp ? "OPERATOR MOMENTUM" : "CONSISTENCY RISK DETECTED"}
          </div>
        </div>

        {/* Bar Graph: Made highly responsive, removing labels overlapping */}
        <div className="w-full h-[180px] sm:h-[220px] relative mt-6 mb-8 flex items-end justify-between px-2 sm:px-6">
          <div className="absolute inset-0 pointer-events-none">
            {[25, 50, 75, 100].map(percent => (
              <div 
                key={percent} 
                className="absolute w-full border-b border-white/[0.03] border-dashed" 
                style={{ bottom: `${percent}%` }}
              />
            ))}
          </div>

          {graphData.map((val: number, i: number) => {
            const heightPercent = Math.max(8, (val / 100) * 100); // minimum height to show bar
            return (
              <div key={i} className="relative flex flex-col items-center group w-5 sm:w-10 h-full justify-end z-10">
                {/* Tooltip */}
                <div className="absolute -top-7 bg-white text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  {val}%
                </div>
                
                {/* The Bar */}
                <div 
                  className="w-full rounded-t-[3px] sm:rounded-t-md relative overflow-hidden transition-all duration-300"
                  style={{ 
                    height: `${heightPercent}%`, 
                    background: isTrendUp ? 'linear-gradient(to top, rgba(255,255,255,0.03), rgba(255,255,255,0.85))' : 'linear-gradient(to top, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.85))',
                    boxShadow: `0 0 12px ${isTrendUp ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.1)'}`
                  }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${isTrendUp ? 'bg-white' : 'bg-red-400'}`} />
                </div>
                
                {/* X-axis label */}
                <div className="absolute -bottom-5 text-[8px] sm:text-[9px] font-mono text-[#52525b]">
                  W{i + 1}
                </div>
              </div>
            );
          })}
        </div>
        
        {!isTrendUp && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 mt-2">
            <p className="text-xs text-red-400 font-medium leading-relaxed flex items-start gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              Bhai teri execution direction decay ho rahi hai. Weekend pe apne targets fix kar, warna AI model ke hisaab se tera drop-off pakka hai.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="text-[10px] font-mono text-[#71717a] tracking-[0.25em] uppercase">Diagnostic Signal</div>
        <p className="text-white text-sm sm:text-base leading-relaxed font-semibold">
          &quot;{insight}&quot;
        </p>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <div className="text-[9px] font-mono text-[#a1a1aa] tracking-[0.2em] uppercase mb-4 flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-white" /> Strengths Detected
            </div>
            {strengths.length === 0 ? (
              <div className="text-[#52525b] text-xs font-mono">FP will map your strengths after consistent daily execution.</div>
            ) : (
              <ul className="space-y-3 text-xs text-[#d4d4d8] leading-relaxed">
                {strengths.map((s: string, idx: number) => (
                  <li key={idx} className="flex gap-2"><span className="text-[#71717a] shrink-0">·</span> {s}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="border border-red-500/10 bg-red-500/[0.01] rounded-xl p-4 sm:p-5">
            <div className="text-[9px] font-mono text-red-500 tracking-[0.2em] uppercase mb-4 flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-red-500" /> Friction Point Matrix
            </div>
            {bottlenecks.length === 0 ? (
              <div className="text-[#52525b] text-xs font-mono">No friction points logged yet. Keep executing.</div>
            ) : (
              <ul className="space-y-3 text-xs text-[#d4d4d8] leading-relaxed">
                {bottlenecks.map((b: string, idx: number) => (
                  <li key={idx} className="flex gap-2"><span className="text-red-500 shrink-0">·</span> {b}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabDebt({ missionData }: { missionData?: MissionData }) {
  if (!missionData && false) {
    return <div className="text-[#a1a1aa] text-center font-mono py-12 animate-pulse text-[10px] tracking-widest uppercase">Syncing debt indices...</div>;
  }
  
  const debtDays = missionData?.debtDays || 4;
  const consistencyScore = missionData?.consistencyScore || 42;
  const daysToGoal = missionData?.daysToGoal || 320;
  const streakDays = missionData?.streakDays || 2;
  const hasDebt = debtDays > 0;

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Metrics Row: Grid layout for responsive sizing */}
      <div className="glass-card rounded-2xl p-4 sm:p-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-3xl mx-auto">
          <Dial 
            title="CONSISTENCY" 
            value={`${consistencyScore}`} 
            sub="SCORE" 
            color="#ffffff" 
            strokeOffset={`${276 - (276 * consistencyScore) / 100}`} 
          />
          <Dial 
            title="BACKLOG DEBT" 
            value={`${debtDays}`} 
            sub="DAYS" 
            color="#ef4444" 
            strokeOffset={`${276 - (276 * Math.min(debtDays, 14)) / 14}`} 
          />
          <Dial 
            title="TIMELINE" 
            value={`${daysToGoal}`} 
            sub="TO GOAL" 
            color="#71717a" 
            strokeOffset={`${276 - (276 * Math.max(0, 90 - daysToGoal)) / 90}`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-red-500/10 bg-red-500/[0.01] rounded-xl p-4 sm:p-5">
          <div className="text-[9px] font-mono text-red-500 tracking-[0.2em] uppercase mb-2">Backlog Analysis</div>
          <p className="text-xs text-[#d4d4d8] leading-relaxed">
            {hasDebt ? (
              <>Your backlog is equivalent to <strong className="text-red-500 font-bold">{debtDays} days</strong> of raw study drift. An average competitor took 0 days off in this phase. Your target needs adjustment.</>
            ) : (
              <>No accumulated execution debt. You are keeping up with the batch schedule perfectly. Keep the target locked.</>
            )}
          </p>
        </div>

        <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4 sm:p-5">
          <div className="text-[9px] font-mono text-[#a1a1aa] tracking-[0.2em] uppercase mb-2">Streak Multiplier</div>
          <p className="text-xs text-[#d4d4d8] leading-relaxed">
            Tune <strong className="text-white font-bold">{streakDays} lagataar</strong> din execute kiya hai. Consistency se tere brain mein positive habit loop ban raha hai. Is streak ko tootne mat dena.
          </p>
        </div>
      </div>
    </div>
  );
}

const Dial = ({ title, value, sub, color, strokeOffset }: { title: string, value: string, sub: string, color: string, strokeOffset: string }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative size-16 sm:size-28 md:size-36 mb-3">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
        <circle 
          cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="4" 
          strokeDasharray="276" strokeDashoffset={strokeOffset} strokeLinecap="round" 
          style={{ filter: `drop-shadow(0 0 6px ${color}20)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm sm:text-xl md:text-2xl font-black text-white leading-none mb-0.5">{value}</span>
        <span className="text-[7px] sm:text-[8px] font-mono text-[#71717a] tracking-wider font-bold">{sub}</span>
      </div>
    </div>
    <div className="text-[8px] sm:text-[9px] font-mono text-[#52525b] tracking-[0.12em] uppercase text-center font-semibold leading-none">{title}</div>
  </div>
);

function TabRival({ rivalData }: { rivalData?: RivalData }) {
  if (!rivalData && false) {
    return <div className="text-[#a1a1aa] text-center font-mono py-12 animate-pulse text-[10px] tracking-widest uppercase">Connecting to Peer Node...</div>;
  }
  const totalUsers = rivalData?.totalUsers || 1640000;
  const milestonePassed = rivalData?.milestonePassedUsers || 342500;
  const category = rivalData?.category || "JEE Main 2026 (Gen)";
  
  return (
    <div className="space-y-4 animate-fade-in w-full">
      <div className="glass-card rounded-2xl relative overflow-hidden p-5 sm:p-8 flex flex-col justify-center min-h-[260px]">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", 
            backgroundSize: "60px 60px",
          }} 
        />

        <div className="absolute top-4 right-4 flex items-center gap-1 text-[8px] font-mono text-[#71717a] tracking-widest uppercase">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" /> Live Stats
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="border-b border-white/5 pb-4">
            <div className="text-[8px] font-mono text-[#52525b] tracking-[0.2em] uppercase mb-1.5">Competition Base ({category})</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-[#d4d4d8]">
              Bhai, exactly tere jaisa goal lekar <strong className="text-white font-bold">{totalUsers.toLocaleString()} bachhe</strong> is waqt race mein hain.
            </div>
          </div>
          
          <div className="border-b border-white/5 pb-4">
            <div className="text-[8px] font-mono text-[#52525b] tracking-[0.2em] uppercase mb-1.5">Frontrunners (The Real Threat)</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-[#d4d4d8]">
              Dhyan se sun. <strong className="text-white font-bold">{milestonePassed.toLocaleString()} bachho</strong> ne already tujhse zyada syllabus aur sprints complete kar liye hain. Woh aage hain tujhse.
            </div>
          </div>
          
          <div>
            <div className="text-[8px] font-mono text-[#52525b] tracking-[0.2em] uppercase mb-2">Teri Aukaat (Current Rank)</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-red-500 flex items-center gap-3">
              Abhi teri rank danger zone mein hai. Wake up.
              <div className="h-[1px] w-12 bg-red-500/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabMarket({ marketData }: { marketData?: MarketData }) {
  if (!marketData && false) {
    return <div className="text-[#a1a1aa] text-center font-mono py-12 animate-pulse text-[10px] tracking-widest uppercase">Connecting market indexes...</div>;
  }

  const signals = marketData?.skillDemandSignals || [
    { skillName: "Modern Physics", demandLevel: "Extremely High (NTA Fav)" },
    { skillName: "Integration", demandLevel: "Low ROI (Time Waste)" },
    { skillName: "Inorganic Chem", demandLevel: "High Scoring (NCERT)" }
  ];
  const gaps = marketData?.localMarketGaps || [
    { gapDescription: "80% competitors are skipping Coordinate Geometry.", opportunitySize: "Massive Edge" },
    { gapDescription: "Mock test analysis is being completely ignored by peers.", opportunitySize: "Critical Advantage" }
  ];
  const timing = marketData?.timingSignals?.[0] || { timeframe: "3 Months Left", urgency: "CRITICAL" };
  const insight = marketData?.topInsight || "Bhai, NTA ka pattern badal gaya hai. Sirf gadhe jaisi mehnat se kuch nahi hoga, smart execution se marks aayenge. Unnecessary topics turant drop kar.";

  return (
  return (
    <div className="flex flex-col gap-4 animate-fade-in w-full">
      {/* Hero Banner: Urgent Insight */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#1a0505] to-black p-5 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
        <div className="absolute top-[-20%] right-[-5%] p-4 opacity-10 pointer-events-none">
          <Radio className="size-32 text-red-500" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono text-red-500 tracking-[0.2em] uppercase">
            Global Market Alert • {timing.timeframe}
          </span>
        </div>
        
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-3 leading-tight max-w-2xl relative z-10">
          <span className="text-red-500">{timing.urgency} OVERRIDE:</span> Adapt or Perish.
        </h3>
        <p className="text-sm sm:text-base text-[#d4d4d8] font-medium leading-relaxed max-w-3xl relative z-10">
          {insight}
        </p>
      </div>

      {/* Data Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Signals */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 border-t-[3px] border-t-cyan-500/50 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <div className="text-[9px] font-mono text-[#a1a1aa] tracking-[0.2em] uppercase mb-1">Subject Weightage</div>
              <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Exam Focus Signals</h4>
            </div>
            <TrendingUp className="size-5 text-cyan-400 opacity-80" />
          </div>
          
          <div className="space-y-3 relative z-10">
            {signals.length === 0 ? (
              <div className="text-[#52525b] text-xs font-mono">Loading data feeds...</div>
            ) : (
              signals.map((signal: MarketSignal, idx: number) => {
                const isHigh = (signal.demandLevel || signal.trend || '').toLowerCase().includes('high') || (signal.demandLevel || signal.trend || '').toLowerCase().includes('fav');
                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#09090b] border border-white/5 hover:border-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 font-mono text-[10px] font-bold text-[#71717a]">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs sm:text-[13px] font-bold text-white mb-0.5">{signal.skillName || signal.name}</div>
                        <div className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-wider">Trend Vector</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] sm:text-xs font-bold uppercase px-2 py-1 rounded bg-white/[0.03] border ${
                        isHigh ? 'text-cyan-400 border-cyan-500/20' : 'text-amber-500 border-amber-500/20'
                      }`}>
                        {signal.demandLevel || signal.trend}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Gaps */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 border-t-[3px] border-t-amber-500/50 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <div className="text-[9px] font-mono text-[#a1a1aa] tracking-[0.2em] uppercase mb-1">Blind Spots</div>
              <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Peer Practice Gaps</h4>
            </div>
            <Trophy className="size-5 text-amber-500 opacity-80" />
          </div>
          
          <div className="space-y-3 relative z-10">
            {gaps.length === 0 ? (
              <div className="text-[#52525b] text-xs font-mono">Loading chapters...</div>
            ) : (
              gaps.map((gap: MarketGap, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#09090b] border border-white/5 relative overflow-hidden group/item hover:border-amber-500/30 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/20 group-hover/item:bg-amber-500 transition-colors" />
                  <div className="pl-2">
                    <div className="text-xs sm:text-[13px] text-white font-medium mb-2.5 leading-snug">
                      {gap.gapDescription}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-[#71717a] uppercase">Advantage Size:</span>
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {gap.opportunitySize}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#71717a] uppercase">Aggregated Readiness</span>
              <span className="text-xs font-black text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-md uppercase tracking-wider animate-pulse">
                Critical Danger
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

