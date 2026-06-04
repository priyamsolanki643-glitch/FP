"use client";

import { useState, useEffect } from "react";
import {
  Lock, X, Target, Activity, BarChart3, Users, TrendingUp,
  ArrowRight, CheckCircle, AlertTriangle, Clock, Zap,
  MapPin, BarChart2
} from "lucide-react";

/* ──────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────── */
type TabId = "missions" | "mirror" | "debt" | "rival" | "market";

interface VaultModalProps {
  onClose: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "missions", label: "Mission Folders", icon: Target },
  { id: "mirror",   label: "Reality Mirror",  icon: Activity  },
  { id: "debt",     label: "Execution Debt",  icon: BarChart3 },
  { id: "rival",    label: "Rival Index",     icon: Users     },
  { id: "market",   label: "Market Analyser", icon: TrendingUp },
];

/* ──────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────── */
export function VaultModal({ onClose }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("missions");
  const [mounted, setMounted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<any>(null);
  const [mirror, setMirror] = useState<any>(null);
  const [rival, setRival] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
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
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Fetch all endpoints concurrently
        const [resMission, resMirror, resRival, resMarket] = await Promise.all([
          fetch(`${baseUrl}/api/v1/interaction/active-mission`),
          fetch(`${baseUrl}/api/v1/interaction/reality-mirror`),
          fetch(`${baseUrl}/api/v1/interaction/rival-index`),
          fetch(`${baseUrl}/api/v1/interaction/market-report`)
        ]);

        const [dataMission, dataMirror, dataRival, dataMarket] = await Promise.all([
          resMission.json(),
          resMirror.json(),
          resRival.json(),
          resMarket.json()
        ]);

        if (dataMission?.data) setMission(dataMission.data);
        if (dataMirror?.data) setMirror(dataMirror.data);
        if (dataRival?.data) setRival(dataRival.data);
        if (dataMarket?.data) setMarket(dataMarket.data);
      } catch (err: any) {
        console.error("Failed fetching vault data from backend:", err);
        setError("Core connection failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchVaultData();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl cursor-pointer"
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[24px] glass-strong flex flex-col text-text-primary transition-all duration-500 ${
          mounted ? "animate-vault-in" : "opacity-0"
        }`}
        style={{ boxShadow: "var(--shadow-vault)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 md:px-7 h-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Lock className="size-3.5 text-text-secondary" />
            <span className="font-display text-sm font-medium">Vault</span>
            <span className="font-mono text-[9px] tracking-[0.28em] text-text-tertiary ml-1.5 hidden sm:inline">
              PRIVATE · ENCRYPTED
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-full hover:bg-white/5 text-text-secondary hover:text-text-primary transition cursor-pointer"
            aria-label="Close vault"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 px-4 md:px-6 py-2.5 border-b border-border overflow-x-auto no-scrollbar shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3.5 h-8 rounded-full text-sm whitespace-nowrap transition cursor-pointer font-medium ${
                  active
                    ? "bg-text-primary text-black"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-7 py-6 space-y-0">
          {error && (
            <div className="p-4 border border-red-500/15 bg-red-500/5 text-red-400 rounded-xl mb-4 text-sm font-mono flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {error} Please ensure the backend is running.
            </div>
          )}
          
          {activeTab === "missions"  && <TabMissions mission={mission} loading={loading} onClose={onClose} />}
          {activeTab === "mirror"   && <TabMirror mirror={mirror} loading={loading} />}
          {activeTab === "debt"     && <TabDebt mission={mission} loading={loading} />}
          {activeTab === "rival"    && <TabRival rival={rival} loading={loading} />}
          {activeTab === "market"   && <TabMarket market={market} loading={loading} />}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 md:px-7 h-10 border-t border-border flex items-center justify-between font-mono text-[9px] tracking-[0.28em] text-text-tertiary shrink-0">
          <span>INTEGRITY · 100%</span>
          <span className="hidden sm:inline">ESC TO CLOSE · AES-256</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   SKELETONS & EMPTY STATES
────────────────────────────────────────────────────── */
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse py-4">
      <div className="h-6 w-1/3 bg-white/10 rounded" />
      <div className="h-4 w-2/3 bg-white/5 rounded" />
      <div className="h-32 w-full bg-white/5 rounded-2xl" />
      <div className="h-24 w-full bg-white/5 rounded-2xl" />
    </div>
  );
}

function EmptyState({ tab, msg }: { tab: string; msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <AlertTriangle className="size-10 text-text-secondary opacity-40 animate-pulse" />
      <h3 className="font-display text-sm font-medium text-text-secondary">Empty {tab}</h3>
      <p className="text-xs text-text-tertiary max-w-sm leading-relaxed">
        {msg}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   TAB 1 — MISSION FOLDERS
────────────────────────────────────────────────────── */
function TabMissions({ mission, loading, onClose }: { mission: any; loading: boolean; onClose: () => void }) {
  if (loading) return <SkeletonLoader />;
  if (!mission) return <EmptyState tab="Missions" msg="No active mission trajectory locked. Complete onboarding and lock a path to initiate." />;

  const pct = Math.round((mission.dayNumber / mission.totalDays) * 100);
  const consistencyColor =
    mission.consistencyScore >= 75 ? "#4ade80" : mission.consistencyScore >= 55 ? "#facc15" : "#f87171";

  return (
    <div className="animate-fade-up space-y-4">
      <SectionHeader
        title="Mission Folders"
        desc="Your active missions. Every one locked by FP — no edits, only execution."
      />
      <div className="rounded-2xl border border-border bg-white/[0.02] overflow-hidden">
        {/* Progress bar top */}
        <div className="h-[2px] bg-white/[0.06]">
          <div
            className="h-full bg-white/70 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-5 md:p-6 space-y-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="size-2 rounded-full bg-text-primary shrink-0" />
                <h3 className="font-display text-base font-medium">{mission.missionName}</h3>
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-text-tertiary pl-4.5 flex items-center gap-3">
                <span>DAY {mission.dayNumber} OF {mission.totalDays}</span>
                <span>·</span>
                <span style={{ color: consistencyColor }}>{mission.consistencyScore}% CONSISTENT</span>
                {mission.streakDays > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-text-tertiary">{mission.streakDays}D STREAK</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-2xl font-medium text-text-primary">{pct}%</div>
              <div className="font-mono text-[9px] text-text-tertiary tracking-widest">COMPLETE</div>
            </div>
          </div>

          {/* Mindset brief */}
          <div className="rounded-xl border border-border bg-black/40 p-4">
            <div className="font-mono text-[9px] tracking-[0.25em] text-text-tertiary mb-2">
              MINDSET BRIEF · FP
            </div>
            <p className="text-sm text-text-secondary leading-relaxed italic">
              &ldquo;{mission.mindsetBrief}&rdquo;
            </p>
          </div>

          {/* Strategy summary */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-text-tertiary mb-2">
              STRATEGY · LOCKED PATH ({mission.lockedPath?.toUpperCase()})
            </div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {mission.strategyContent}
            </p>
          </div>

          {/* Continue button */}
          <button
            onClick={() => {
              if (mission.chatThreadId) {
                localStorage.setItem("active_chat_thread_id", mission.chatThreadId);
              }
              onClose();
            }}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-primary text-black font-medium text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Continue Mission
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   TAB 2 — REALITY MIRROR
────────────────────────────────────────────────────── */
function TabMirror({ mirror, loading }: { mirror: any; loading: boolean }) {
  if (loading) return <SkeletonLoader />;
  if (!mirror) return <EmptyState tab="Reality Mirror" msg="Reality Mirror data will populate once your active trajectory is locked." />;

  const current = mirror.history[mirror.history.length - 1] || 100;
  const start   = mirror.history[0] || 100;

  return (
    <div className="animate-fade-up space-y-5">
      <SectionHeader
        title="Reality Mirror"
        desc="Your consistency timeline. No filters."
      />

      {/* Line graph card */}
      <div className="rounded-2xl border border-border bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[9px] tracking-[0.25em] text-text-tertiary">
            CONSISTENCY SCORE · HISTORY
          </div>
          <div
            className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest px-2.5 py-1 rounded-full border ${
              mirror.trend === "up"
                ? "border-green-500/25 text-green-400 bg-green-500/5"
                : "border-amber-500/25 text-amber-400 bg-amber-500/5"
            }`}
          >
            <div className={`size-1.5 rounded-full ${mirror.trend === "up" ? "bg-green-400" : "bg-amber-400"} animate-pulse`} />
            {mirror.trend === "up" ? "Operator mode activated" : "Bhai kya ho raha hai"}
          </div>
        </div>

        <ConsistencyChart data={mirror.history} trend={mirror.trend} />

        {/* Key markers */}
        <div className="flex items-center justify-between mt-3 font-mono text-[9px] text-text-tertiary tracking-widest">
          <span>DAY 1 · {start}%</span>
          <span>TODAY · {current}%</span>
        </div>
      </div>

      {/* Behavioral Insight */}
      <div className="rounded-2xl border border-border bg-white/[0.02] p-5 space-y-4">
        <div className="font-mono text-[9px] tracking-[0.25em] text-text-tertiary">
          BEHAVIORAL INSIGHT · FP ANALYSIS
        </div>
        <p className="text-sm text-text-secondary leading-[1.8] whitespace-pre-line">
          {mirror.insight}
        </p>

        {mirror.trend === "down" && (
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-200/80 leading-relaxed">
              &ldquo;Yeh numbers teri puri story nahi hain. Day 0 pe tu yahan tha — aaj yahan hai. 
              Direction fix kar. Score follow karega.&rdquo;
            </p>
          </div>
        )}

        {/* Pros / Cons */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <ProsConsBlock type="pros" items={mirror.strengths} />
          <ProsConsBlock type="cons" items={mirror.bottlenecks} />
        </div>
      </div>

      <SectionHeader title="" desc="Insight is based on database log timeline entries and active chat patterns." />
    </div>
  );
}

function ConsistencyChart({ data, trend }: { data: number[]; trend: "up" | "down" }) {
  if (!data || data.length === 0) return null;
  const W = 500, H = 100;
  const pad = { t: 8, r: 8, b: 8, l: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;

  const pts = data.map((v, i) => ({
    x: pad.l + (i / Math.max(1, data.length - 1)) * innerW,
    y: pad.t + (1 - (v - min) / Math.max(1, max - min)) * innerH,
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 3;
    const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) / 3;
    d += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }

  const fillD = `${d} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const lineColor = trend === "up" ? "#4ade80" : "#facc15";
  const gradId = `cg-${trend}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lineColor} stopOpacity={0.18} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0}    />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={3} fill={lineColor} />
    </svg>
  );
}

function ProsConsBlock({ type, items }: { type: "pros" | "cons"; items: string[] }) {
  const isPros = type === "pros";
  const Icon = isPros ? CheckCircle : AlertTriangle;
  const color = isPros ? "text-green-400" : "text-amber-400";
  const bg    = isPros ? "bg-green-500/5 border-green-500/15" : "bg-amber-500/5 border-amber-500/15";

  return (
    <div className={`rounded-xl border p-4 space-y-2.5 ${bg}`}>
      <div className={`flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] ${color}`}>
        <Icon className="size-3" />
        {isPros ? "STRENGTHS" : "BOTTLENECKS"}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[12px] text-text-secondary leading-relaxed flex gap-2">
            <span className={`mt-[3px] size-1.5 rounded-full shrink-0 ${isPros ? "bg-green-400" : "bg-amber-400"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   TAB 3 — EXECUTION DEBT TRACKER
────────────────────────────────────────────────────── */
function TabDebt({ mission, loading }: { mission: any; loading: boolean }) {
  if (loading) return <SkeletonLoader />;
  if (!mission) return <EmptyState tab="Execution Debt" msg="Execution Debt will compile metrics once strategy trajectory is locked." />;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const consistency = mission.consistencyScore;
  const debtDays = mission.debtDays || 0;
  const daysToGoal = mission.daysToGoal || 0;
  const streak = mission.streakDays || 0;
  const hasDebt = debtDays > 0;

  return (
    <div className="animate-fade-up space-y-5">
      <SectionHeader
        title="Execution Debt Tracker"
        desc="Jo kaam nahi kiya — woh yahaan dikh raha hai. Honesty pehle."
      />

      {/* ── 3 Circles ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        <CircleRing
          label="Consistency"
          value={consistency}
          max={100}
          unit="/100"
          color="#fcfbf8"
          animated={animated}
        />
        <CircleRing
          label="Debt Days"
          value={debtDays}
          max={30}
          unit=" Days"
          color="#f87171"
          animated={animated}
          invert
        />
        <CircleRing
          label="Days to Goal"
          value={daysToGoal}
          max={mission.totalDays}
          unit=" Days"
          color="#facc15"
          animated={animated}
        />
      </div>

      {/* ── Debt Impact Block ── */}
      {hasDebt && (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-red-400/70">
            <AlertTriangle className="size-3" />
            DEBT IMPACT
          </div>
          <p className="text-sm text-text-secondary leading-[1.8]">
            In {debtDays} dinon mein teri competition ne tasks execute kiye.
            Market capacity constant rate pe drop hoti hai. Tu wahan khada hai jahan tha —{" "}
            <span className="text-red-300/80">duniya aage nikal gayi.</span>
          </p>
        </div>
      )}

      {/* ── Consistency Win Block ── */}
      {streak >= 3 && (
        <div className="rounded-2xl border border-green-500/15 bg-green-500/[0.04] p-5 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-green-400/70">
            <CheckCircle className="size-3" />
            CONSISTENCY WIN · {streak} DAY STREAK
          </div>
          <p className="text-sm text-text-secondary leading-[1.8]">
            Tu ne <span className="text-text-primary font-medium">{streak} din lagaataar execute kiya.</span>{" "}
            This streak adds an operational buffer, locking in your capability baseline.
          </p>
        </div>
      )}

      {/* ── Dynamic bottom line ── */}
      <div className="rounded-xl border border-border bg-white/[0.02] px-5 py-3.5 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {hasDebt
            ? "Duniya nahi ruki bhai — tu ruka tha. Aaj se mat ruk."
            : "Operator. No debt. Teri consistency compounding ho rahi hai."}
        </p>
        <div
          className={`size-2 rounded-full shrink-0 ml-3 ${
            hasDebt ? "bg-red-400 animate-pulse" : "bg-green-400 animate-pulse"
          }`}
        />
      </div>

      <LegalText text="Debt numbers calculated dynamically based on database logs." />
    </div>
  );
}

function CircleRing({
  label, value, max, unit, color, animated, invert,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  animated: boolean;
  invert?: boolean;
}) {
  const R = 38;
  const C = 2 * Math.PI * R;
  const fraction = value / Math.max(1, max);
  const offset = animated ? C * (1 - fraction) : C;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white/[0.02] p-4 md:p-5">
      <div className="font-mono text-[9px] tracking-[0.2em] text-text-tertiary text-center">
        {label.toUpperCase()}
      </div>
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="46" cy="46" r={R}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform="rotate(-90 46 46)"
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        <text x="46" y="42" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="16" fontWeight="600" fontFamily="monospace">
          {value}
        </text>
        <text x="46" y="58" textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace">
          {unit.trim()}
        </text>
      </svg>
      <div className="font-mono text-[9px] text-text-tertiary tracking-widest text-center">
        {invert
          ? `${Math.round(fraction * 100)}% of max`
          : `${Math.round(fraction * 100)}% of target`}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   TAB 4 — RIVAL INDEX
────────────────────────────────────────────────────── */
function TabRival({ rival, loading }: { rival: any; loading: boolean }) {
  if (loading) return <SkeletonLoader />;
  if (!rival) return <EmptyState tab="Rival Index" msg="Rival Index aggregate data will populate once your active strategy path is locked." />;

  const crossRate = Math.round((rival.milestonePassedUsers / Math.max(1, rival.totalUsers)) * 100);

  return (
    <div className="animate-fade-up space-y-5">
      <SectionHeader
        title="Rival Index"
        desc="Anonymous. Aggregated. Real market signal — no names, no personal data."
      />

      <div className="rounded-2xl border border-border bg-white/[0.02] p-6 md:p-8 space-y-6">
        {/* Big number */}
        <div className="space-y-1">
          <div className="font-mono text-[9px] tracking-[0.25em] text-text-tertiary">
            SAME TRAJECTORY CATEGORY · ANONYMOUS POOL
          </div>
          <div className="font-display text-5xl md:text-6xl font-medium text-text-primary leading-none">
            {rival.totalUsers}
          </div>
          <div className="text-sm text-text-secondary">
            users executing on goals similar to yours.
          </div>
        </div>

        {/* Status blocks */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-black/40 p-4 text-center space-y-1.5">
            <div className="font-mono text-2xl font-semibold text-green-400">{rival.milestonePassedUsers}</div>
            <div className="font-mono text-[9px] text-text-tertiary tracking-[0.15em] leading-tight">
              DAY 30 CROSSED
            </div>
          </div>
          <div className="rounded-xl border border-border bg-black/40 p-4 text-center space-y-1.5">
            <div className="font-mono text-2xl font-semibold text-amber-400">{crossRate}%</div>
            <div className="font-mono text-[9px] text-text-tertiary tracking-[0.15em] leading-tight">
              MILESTONE CROSS RATE
            </div>
          </div>
        </div>

        {/* Where are you */}
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Tere jaise <span className="text-text-primary font-medium">{rival.totalUsers}</span> operators same vector pe hain.{" "}
            <span className="text-text-primary font-medium">{rival.milestonePassedUsers} already Day 30 benchmark touch kar chuke hain.</span>{" "}
            Tu kahan stand karta hai?
          </p>
          <div className="shrink-0 font-mono text-3xl text-text-tertiary">??</div>
        </div>
      </div>

      <LegalText text="Rival index metrics are completely anonymised aggregates pulling from real active trajectories." />
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   TAB 5 — MARKET ANALYSER
────────────────────────────────────────────────────── */
function TabMarket({ market, loading }: { market: any; loading: boolean }) {
  if (loading) return <SkeletonLoader />;
  if (!market) return <EmptyState tab="Market Analyser" msg="Market Intelligence report will build once onboarding is fully completed." />;

  const gaps = market.localMarketGaps || [];
  const timing = market.timingSignals || [];
  const score = Math.round((market.overallMarketScore || 0.75) * 100);
  const opportunities = market.socialMediaOpportunities || [];

  return (
    <div className="animate-fade-up space-y-5">
      <SectionHeader
        title="Market Analyser"
        desc="Real-time feasibility report. Automatically generated and cached for 24 hours."
      />

      {/* Local Gaps */}
      <MarketSection icon={MapPin} title="LOCAL OPPORTUNITY GAPS" accent="white">
        {gaps.length > 0 ? (
          <ul className="space-y-3.5">
            {gaps.slice(0, 3).map((gap: any, idx: number) => (
              <li key={idx} className="flex flex-col py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium text-text-primary mb-1">{gap.gapTitle}</span>
                <p className="text-xs text-text-secondary mb-2">{gap.problemDescription}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                  <span>AVG BUDGET: ₹{gap.averageSpendPerBusiness?.toLocaleString('en-IN')}</span>
                  <span className="text-amber-400">WIN WINDOW: {gap.windowDurationMonths} MONTHS</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-secondary">No local service opportunity gaps cataloged.</p>
        )}
      </MarketSection>

      {/* Timing signal */}
      <MarketSection icon={Clock} title="TIMING SIGNAL ANALYSIS" accent="amber">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="font-mono text-3xl font-semibold text-amber-300">{score}%</div>
            <div>
              <div className="text-sm text-text-primary font-medium">Market Feasibility Score</div>
              <div className="font-mono text-[9px] text-text-tertiary tracking-widest">FEASIBILITY PROFILE</div>
            </div>
          </div>
          
          {timing.length > 0 ? (
            <div className="space-y-2">
              <span className="text-sm text-text-primary font-medium block">
                {timing[0].signal} ({timing[0].urgency?.toUpperCase().replace('_', ' ')})
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {timing[0].narrative}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-secondary">No timing alerts registered for this category.</p>
          )}
        </div>
      </MarketSection>

      {/* Traffic channels */}
      <MarketSection icon={BarChart2} title="TRAFFIC CHANNELS & BENCHMARKS" accent="white">
        {opportunities.length > 0 ? (
          <ul className="space-y-2.5">
            {opportunities.slice(0, 3).map((opp: any, idx: number) => (
              <li key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-sm">
                <div>
                  <span className="font-medium text-text-primary capitalize">{opp.platform}</span>
                  <span className="text-[10px] text-text-tertiary block font-mono uppercase">{opp.contentFormat}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-green-400 text-xs">{opp.postingFrequency}</span>
                  <span className="text-[10px] text-text-tertiary block font-mono uppercase">FIRST PAYOUT: {opp.timeToFirstRevenue}M</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-secondary">No custom traffic channels identified yet.</p>
        )}
      </MarketSection>

      {/* Insight card */}
      <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-5 py-4 flex items-center gap-3">
        <Zap className="size-4 text-red-400 shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          {market.topInsight || "Opportunities decay over time. Fast mover beats the planner."}
        </p>
      </div>

      <LegalText text={market.legalDisclaimer || "Market intelligence reports are generated via active grounding search. direction-only data."} />
    </div>
  );
}

function MarketSection({
  icon: Icon, title, accent, children,
}: {
  icon: React.ElementType;
  title: string;
  accent: "white" | "amber" | "green";
  children: React.ReactNode;
}) {
  const iconColor =
    accent === "amber" ? "text-amber-400" :
    accent === "green" ? "text-green-400" :
    "text-text-secondary";

  return (
    <div className="rounded-2xl border border-border bg-white/[0.02] p-5 space-y-4">
      <div className={`flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] ${iconColor}`}>
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   SHARED COMPONENTS
────────────────────────────────────────────────────── */
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-1 pb-1">
      <h2 className="font-display text-base font-medium text-text-primary">{title}</h2>
      <p className="text-sm text-text-tertiary leading-relaxed">{desc}</p>
    </div>
  );
}

function LegalText({ text }: { text: string }) {
  return (
    <p className="font-mono text-[9px] text-text-tertiary/50 leading-relaxed tracking-wide">
      {text}
    </p>
  );
}
