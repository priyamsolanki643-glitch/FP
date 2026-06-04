"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, PenLine, Ellipsis, ArrowUp, Mic, Paperclip, Sparkles, ChevronDown, TrendingUp, Calendar, Zap } from "lucide-react";

interface ChatViewProps {
  onOpenSidebar: () => void;
  onOpenVault: () => void;
}

interface Message {
  id: string;
  role: "user" | "fp";
  text: string;
  timestamp: Date;
}

const CHAT_SUGGESTIONS = [
  { icon: "🗺️", label: "Map a 90-day execution sprint" },
  { icon: "🔍", label: "Audit my last week of work" },
  { icon: "⚡", label: "First-principles my biggest goal" },
  { icon: "📍", label: "Find arbitrage in my locality" },
];

const STAT_CARDS = [
  { icon: Calendar, label: "Sprint Day", value: "02 / 90", color: "text-violet-400", bg: "bg-violet-500/8" },
  { icon: TrendingUp, label: "Execution Rate", value: "73%", color: "text-emerald-400", bg: "bg-emerald-500/8" },
  { icon: Zap, label: "Next Task", value: "09:00", color: "text-blue-400", bg: "bg-blue-500/8" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night.";
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  if (h < 21) return "Good evening.";
  return "Good night.";
}

export function ChatView({ onOpenSidebar, onOpenVault }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isThinking) return;

    const userMsgId = String(Date.now());
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text, timestamp: new Date() },
    ]);
    setInput("");
    setIsThinking(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/v1/interaction/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();

      let reply = "System response received.";
      if (data?.data?.ai_response?.response_text) {
        reply = data.data.ai_response.response_text;
      } else if (data?.data?.engine_result?.data?.systemPrompt) {
        reply = "Prompt generated: " + data.data.engine_result.data.systemPrompt.substring(0, 100) + "…";
      }

      setMessages((prev) => [
        ...prev,
        { id: String(Date.now()), role: "fp", text: reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "fp",
          text: "Connection to FP-OS core failed. Ensure backend is running on port 8000.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const isInitial = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden" style={{ background: "rgba(4,3,10,0.98)" }}>
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-950/8 to-transparent pointer-events-none z-0" />

      {/* ── Chat Header ── */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-3 md:px-5 h-14 border-b border-border-soft backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden size-9 grid place-items-center rounded-full hover:bg-white/[0.06] text-text-secondary hover:text-text-primary cursor-pointer transition-all"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Model selector */}
          <button className="group flex items-center gap-2 px-3 h-9 rounded-xl hover:bg-white/[0.05] transition-all duration-200 cursor-pointer">
            <div className="relative size-5 grid place-items-center">
              <Sparkles className="size-4 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-display text-[15px] font-medium text-text-primary">FP</span>
            <span className="font-display text-[15px] text-text-tertiary">Flash</span>
            <ChevronDown className="size-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenVault}
            className="size-9 grid place-items-center rounded-full hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="New chat"
          >
            <PenLine className="size-[17px]" />
          </button>
          <button className="size-9 grid place-items-center rounded-full hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer">
            <Ellipsis className="size-5" />
          </button>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 md:px-8">
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          {/* Empty state */}
          {isInitial && (
            <div className="pt-10 md:pt-16 space-y-6 animate-fade-up">
              {/* Greeting */}
              <div>
                <h2 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] font-medium tracking-tight leading-[1.05]">
                  <span className="shimmer-text">{getGreeting()}</span>
                </h2>
                <p className="mt-3 text-text-secondary text-base md:text-lg leading-relaxed">
                  What are we executing today?
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2 stagger">
                {STAT_CARDS.map(({ icon: Icon, label, value, color, bg }) => (
                  <div
                    key={label}
                    className={`animate-fade-up glass-card rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-all hover-lift`}
                  >
                    <div className={`size-8 rounded-xl ${bg} grid place-items-center mb-3`}>
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <div className={`text-lg font-mono font-semibold ${color}`}>{value}</div>
                    <div className="text-[11px] text-text-tertiary mt-0.5 font-mono tracking-wide uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <ChatMessageBubble key={msg.id} msg={msg} index={i} />
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="animate-fade-up flex items-center gap-3 pt-2">
              <div className="size-7 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/20 grid place-items-center shrink-0">
                <Sparkles className="size-3.5 text-violet-400" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl glass-card">
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Input Area ── */}
      <div className="relative z-10 px-3 md:px-8 pb-5 pt-3">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {/* Suggestion chips */}
          {isInitial && (
            <div className="flex flex-wrap gap-2 stagger">
              {CHAT_SUGGESTIONS.map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => handleSend(label)}
                  className="animate-fade-up group flex items-center gap-2 px-3.5 py-2 text-[13px] rounded-full border border-border-soft bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/20 transition-all duration-200 cursor-pointer"
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className={`relative rounded-[24px] border transition-all duration-300 ${
              isFocused
                ? "border-violet-500/30 shadow-[0_0_0_4px_rgba(139,92,246,0.06),0_0_24px_rgba(139,92,246,0.08)]"
                : "border-border-soft"
            }`}
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)" }}
          >
            {/* Inner glow on focus */}
            {isFocused && (
              <div className="absolute inset-0 rounded-[24px] pointer-events-none bg-gradient-to-b from-violet-500/[0.03] to-transparent" />
            )}

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask FP anything…"
              rows={1}
              className="relative w-full bg-transparent outline-none resize-none px-5 pt-4 pb-2 text-[15px] placeholder:text-text-tertiary text-text-primary leading-relaxed"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            />

            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <div className="flex items-center gap-0.5">
                <ActionButton icon={Paperclip} label="Attach" />
              </div>

              <div className="flex items-center gap-1.5">
                {!input.trim() && (
                  <ActionButton icon={Mic} label="Voice" />
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className={`size-9 grid place-items-center rounded-full transition-all duration-200 cursor-pointer ${
                    input.trim() && !isThinking
                      ? "bg-text-primary text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(240,238,232,0.25)] active:scale-95"
                      : "bg-white/[0.06] text-text-tertiary cursor-not-allowed"
                  }`}
                  aria-label="Send"
                >
                  <ArrowUp className={`size-4 transition-transform ${input.trim() ? "rotate-0" : ""}`} />
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-[11px] text-text-tertiary font-mono tracking-wide">
            FP · AI can make mistakes · <span className="hover:text-text-secondary cursor-pointer transition-colors">Double-tap to open Vault</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="size-9 grid place-items-center rounded-full text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
      aria-label={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function ChatMessageBubble({ msg, index }: { msg: Message; index: number }) {
  const fmt = msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (msg.role === "user") {
    return (
      <div className="animate-slide-in-right flex justify-end" style={{ animationDelay: `${index * 20}ms` }}>
        <div className="group max-w-[82%] space-y-1">
          <div
            className="rounded-[20px] rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed text-text-primary"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            {msg.text}
          </div>
          <div className="text-right text-[10px] text-text-tertiary font-mono opacity-0 group-hover:opacity-100 transition-opacity pr-1">
            {fmt}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in-left flex gap-3 pt-1" style={{ animationDelay: `${index * 20}ms` }}>
      {/* FP avatar */}
      <div className="size-7 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 border border-violet-500/20 grid place-items-center shrink-0 mt-0.5">
        <Sparkles className="size-3.5 text-violet-300" />
      </div>

      <div className="group flex-1 min-w-0 space-y-1">
        <p className="text-[15px] leading-[1.7] text-text-primary whitespace-pre-wrap">
          {msg.text}
        </p>
        <div className="text-[10px] text-text-tertiary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          {fmt}
        </div>
      </div>
    </div>
  );
}
