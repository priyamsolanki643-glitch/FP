"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar
} from 'recharts';
import { 
  ShieldAlert, Activity, Users, Server, Calculator, 
  TrendingUp, AlertTriangle, Code, ArrowRight, CheckCircle2,
  Clock, BrainCircuit, Target, MessageSquareWarning, Timer, ScanFace
} from 'lucide-react';

// --- DEMO DATA ---
const retentionData = [
  { day: 'Day 0', industry: 100, fp: 100 },
  { day: 'Day 5', industry: 82, fp: 97 },
  { day: 'Day 10', industry: 68, fp: 92 },
  { day: 'Day 15', industry: 54, fp: 88 },
  { day: 'Day 20', industry: 45, fp: 83 },
  { day: 'Day 25', industry: 41, fp: 79 },
  { day: 'Day 30', industry: 38, fp: 76 },
];

const riskData = [
  { name: 'Flight Risk (Quit Zone)', value: 14, color: '#ef4444' },
  { name: 'Drifting (Cons. < 50%)', value: 24, color: '#eab308' },
  { name: 'Locked In (Cons. > 80%)', value: 62, color: '#22c55e' },
];

const frictionData = [
  { name: 'Rotational Mechanics Backlog', count: 5420 },
  { name: 'Skipping Sunday Mock Tests', count: 4100 },
  { name: 'Lectures @ 2x Spd (No Notes)', count: 3250 },
  { name: 'Dopamine Exhaustion (Reels)', count: 2800 },
];

// --- COMPONENTS ---

const DemoBadge = () => (
  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500 font-mono tracking-wider flex items-center gap-1 z-10 backdrop-blur-md">
    <AlertTriangle size={10} />
    DEMO PROJECTION
  </div>
);

const SectionHeader = ({ title, icon: Icon, subtitle }: any) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
      <Icon className="text-green-500" size={24} />
      {title}
    </h2>
    {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

export default function CMOTerminal() {
  const [studentCount, setStudentCount] = useState(100000);
  const [coursePrice, setCoursePrice] = useState(4000);

  // ROI Math (Projected 8.5% lift in retention/conversion over 1 year)
  const retentionLiftPercent = 8.5;
  const studentsSaved = Math.floor(studentCount * (retentionLiftPercent / 100));
  const revenueSaved = studentsSaved * coursePrice;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-green-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight">PW Enterprise Intelligence</h1>
              <p className="text-xs text-green-500 font-mono">FP-OS LOGIC ENGINE • DEMO MODE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Live
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* ROW 1: RETENTION & RISK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECTION 1: RETENTION IMPACT */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
          >
            <DemoBadge />
            <SectionHeader title="Retention Impact" icon={TrendingUp} subtitle="Projected Day-30 Batch Retention vs Industry Avg" />
            
            <div className="flex items-end gap-6 mb-6">
              <div>
                <div className="text-4xl font-bold text-green-500">76%</div>
                <div className="text-sm text-zinc-400 mt-1">FP-OS Projection</div>
              </div>
              <div className="pb-1">
                <div className="text-2xl font-bold text-zinc-600">38%</div>
                <div className="text-sm text-zinc-500">Industry Avg</div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="fp" name="With FP-OS" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="industry" name="Industry Avg" stroke="#52525b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* SECTION 2: DROPOUT RISK RADAR */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative"
          >
            <DemoBadge />
            <SectionHeader title="Dropout Risk Radar" icon={ShieldAlert} subtitle="Real-time behavioral risk classification" />
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-red-500 font-bold text-sm mb-1">Top Dropout Catalyst (This Week)</div>
                  <div className="text-white text-lg">Rotational Mechanics Backlog</div>
                  <div className="text-zinc-400 text-xs mt-1">Affected: 5,420 students in Lakshya Batch</div>
                </div>

                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-green-500 font-bold text-sm">Students Saved</div>
                    <div className="text-zinc-400 text-xs">Intervened via State Lock</div>
                  </div>
                  <div className="text-2xl font-bold text-white">2,840</div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ROW 2: INTELLIGENCE & API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECTION 3: EXECUTION INTELLIGENCE */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative"
          >
            <DemoBadge />
            <SectionHeader title="Execution Intelligence" icon={BarChart} subtitle="Identified friction points causing inconsistency" />
            
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frictionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#999" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                    cursor={{fill: '#18181b'}}
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* SECTION 4: API BLUEPRINT */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative flex flex-col"
          >
            <SectionHeader title="API Integration Blueprint" icon={Server} subtitle="Enterprise-ready webhook architecture" />
            
            {/* Flow Diagram */}
            <div className="flex items-center justify-between p-4 bg-black border border-white/5 rounded-lg mb-6 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                  PW App
                </div>
              </div>
              <ArrowRight className="text-zinc-600" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400">
                  <BrainCircuit size={20} />
                </div>
              </div>
              <ArrowRight className="text-zinc-600" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
                  <Target size={20} />
                </div>
              </div>
            </div>

            <div className="flex-1 bg-black rounded-lg border border-white/10 p-4 font-mono text-xs text-zinc-300 overflow-hidden relative group">
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[10px]">ENTERPRISE READY</span>
              </div>
              <p className="text-zinc-500 mb-2">// Webhook Example: Real-time Dropout Alert</p>
              <p><span className="text-pink-500">POST</span> <span className="text-green-400">/api/v1/webhooks/pw-crm</span></p>
              <br/>
              <p className="text-blue-400">{"{"}</p>
              <p className="pl-4">{"\"event\": "}<span className="text-yellow-300">"risk_escalation"</span>,</p>
              <p className="pl-4">{"\"student_id\": "}<span className="text-yellow-300">"PW-88392"</span>,</p>
              <p className="pl-4">{"\"batch\": "}<span className="text-yellow-300">"Arjuna JEE 2025"</span>,</p>
              <p className="pl-4">{"\"trigger\": "}<span className="text-yellow-300">"4_days_inactive"</span>,</p>
              <p className="pl-4">{"\"recommended_action\": "}<span className="text-yellow-300">"Auto-trigger backlog plan"</span></p>
              <p className="text-blue-400">{"}"}</p>
            </div>
          </motion.section>
        </div>

        {/* ROW 3: ROI CALCULATOR */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative"
        >
          <DemoBadge />
          <SectionHeader title="ROI Calculator" icon={Calculator} subtitle="Projected revenue saved via AI-driven retention" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Total Active Students</span>
                  <span className="text-white font-mono">{studentCount.toLocaleString()}</span>
                </label>
                <input 
                  type="range" min="10000" max="500000" step="5000"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value))}
                  className="w-full accent-green-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Avg. Batch Price (₹)</span>
                  <span className="text-white font-mono">₹{coursePrice.toLocaleString()}</span>
                </label>
                <input 
                  type="range" min="1000" max="10000" step="500"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(parseInt(e.target.value))}
                  className="w-full accent-green-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-black border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
              <div className="text-zinc-400 text-sm mb-2">Projected Revenue Retained / Year</div>
              <div className="text-5xl font-bold text-green-500 mb-4">
                ₹{(revenueSaved / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" />
                Based on a highly conservative 8.5% drop-out prevention rate
              </div>
            </div>
          </div>
        </motion.section>

        {/* ROW 4: PREDICTIVE LINGUISTIC RADAR */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-500 font-mono tracking-wider flex items-center gap-1 z-10 backdrop-blur-md">
            <ScanFace size={10} />
            FP-OS CORE IP
          </div>
          <SectionHeader title="Predictive Linguistic Radar" icon={ScanFace} subtitle="Analyzing 'How' they write to predict dropouts 21 days early" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-black border border-white/5 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex items-center gap-3 mb-3">
                <MessageSquareWarning className="text-red-500" size={20} />
                <div className="text-white font-bold text-sm">Sentence Length Drop</div>
              </div>
              <p className="text-zinc-400 text-xs mb-3">"Usually types 3-4 lines. Today typed 1 line."</p>
              <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-500 text-xs font-mono font-bold text-center">
                DETECTED: STRESS SIGNAL
              </div>
            </div>

            <div className="bg-black border border-white/5 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
              <div className="flex items-center gap-3 mb-3">
                <Timer className="text-yellow-500" size={20} />
                <div className="text-white font-bold text-sm">Response Delay</div>
              </div>
              <p className="text-zinc-400 text-xs mb-3">"Usually replies in 5 mins. Today replied after 2 hours."</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded text-yellow-500 text-xs font-mono font-bold text-center">
                DETECTED: AVOIDANCE BEHAVIOR
              </div>
            </div>

            <div className="bg-black border border-white/5 rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="text-purple-500" size={20} />
                <div className="text-white font-bold text-sm">Hesitation Vocabulary</div>
              </div>
              <p className="text-zinc-400 text-xs mb-3">"Usage of 'but', 'maybe', 'I'll try' spiked by 40%."</p>
              <div className="bg-purple-500/10 border border-purple-500/20 p-2 rounded text-purple-500 text-xs font-mono font-bold text-center">
                DETECTED: EXECUTION COLLAPSE
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-zinc-900 border border-white/5 rounded-lg flex items-center justify-between">
            <div className="text-sm text-zinc-300">
              <span className="text-white font-bold">Action Taken:</span> Generated Weekly Risk Report & Alerted Saarthi Mentor
            </div>
            <div className="text-xs text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
              <CheckCircle2 size={12} /> Dropout Prevented (21 Days Early)
            </div>
          </div>
        </motion.section>

        {/* ROW 5: STUDENT JOURNEY REPLAY */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-500 font-mono tracking-wider flex items-center gap-1 z-10 backdrop-blur-md">
            <Users size={10} />
            ILLUSTRATIVE EXAMPLE
          </div>
          <SectionHeader title="Student Journey Replay" icon={Clock} subtitle="How the Logic Engine intercepts failure points" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            
            {/* Persona 1: Rahul (Linked to Vault Demo) */}
            <div className="bg-black border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-xl p-5 hover:border-red-500/60 transition-colors relative">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-mono tracking-widest rounded-bl-lg">LIVE VAULT LINK</div>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center font-bold text-red-500">R</div>
                <div>
                  <div className="text-white font-bold">Rahul M.</div>
                  <div className="text-xs text-zinc-500 font-mono">JEE 2026 • ₹0 Budget</div>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-red-400 text-[10px] font-bold tracking-widest font-mono uppercase">System Trigger</span>
                  <p className="text-zinc-300 mt-1 text-xs">Trajectory failing (42%ile). Only 4.5 hrs/day available. High flight risk.</p>
                </div>
                <div className="pl-3 border-l-2 border-green-500">
                  <span className="text-green-500 text-[10px] font-bold tracking-widest font-mono uppercase">Lumensky Intervention</span>
                  <p className="text-zinc-400 mt-1 text-xs">Re-routed to free PW Manzil lectures. Bypassed heavy math. Initiated 14-day micro-sprints.</p>
                </div>
                <div>
                  <span className="text-blue-400 text-[10px] font-bold tracking-widest font-mono uppercase">Projected Outcome</span>
                  <p className="text-white mt-1 text-xs font-semibold">Trajectory corrected. On track for 93.41% cutoff.</p>
                </div>
              </div>
            </div>

            {/* Persona 2 */}
            <div className="bg-black border border-white/5 rounded-xl p-5 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">A</div>
                <div>
                  <div className="text-white font-medium">Anjali V.</div>
                  <div className="text-xs text-zinc-500">11th • Arjuna</div>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-yellow-400 text-xs font-bold tracking-wide uppercase">Day 7 Trigger</span>
                  <p className="text-zinc-300 mt-1">Logging fake study hours. Time-to-completion mismatch detected.</p>
                </div>
                <div className="pl-3 border-l-2 border-green-500">
                  <span className="text-green-500 text-xs font-bold tracking-wide uppercase">FP Intervention</span>
                  <p className="text-zinc-400 mt-1">Triggered 'Reality Mirror'. Showed her the widening gap between fake logs and test scores. Locked dopamine apps.</p>
                </div>
                <div>
                  <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">Day 30 Outcome</span>
                  <p className="text-white mt-1">Accepted reality. Honest logging started. 65% real consistency.</p>
                </div>
              </div>
            </div>

            {/* Persona 3 */}
            <div className="bg-black border border-white/5 rounded-xl p-5 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">K</div>
                <div>
                  <div className="text-white font-medium">Karan P.</div>
                  <div className="text-xs text-zinc-500">12th • Offline + Online</div>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-red-400 text-xs font-bold tracking-wide uppercase">Day 20 Trigger</span>
                  <p className="text-zinc-300 mt-1">Overwhelmed by dual coaching. Burnout imminent. Streak broken.</p>
                </div>
                <div className="pl-3 border-l-2 border-green-500">
                  <span className="text-green-500 text-xs font-bold tracking-wide uppercase">FP Intervention</span>
                  <p className="text-zinc-400 mt-1">Restructured protocol. Eliminated non-core tasks. Shifted to 'Maintenance Mode' for 3 days.</p>
                </div>
                <div>
                  <span className="text-blue-400 text-xs font-bold tracking-wide uppercase">Day 30 Outcome</span>
                  <p className="text-white mt-1">Recovered from burnout. Survived the quit-zone.</p>
                </div>
              </div>
            </div>

          </div>
        </motion.section>

      </main>
    </div>
  );
}
