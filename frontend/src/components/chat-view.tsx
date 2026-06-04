"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, PenLine, Ellipsis, ArrowUp, Mic, Paperclip } from "lucide-react";

interface ChatViewProps {
  onOpenSidebar: () => void;
  onOpenVault: () => void;
}

interface Message {
  id: string;
  role: "user" | "fp";
  text: string;
}

const CHAT_SUGGESTIONS = [
  "Map a 90-day execution sprint",
  "Audit my last week of work",
  "First-principles my biggest goal",
  "Find arbitrage in my locality",
];

export function ChatView({ onOpenSidebar, onOpenVault }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isThinking) return;

    const userMsgId = String(Date.now());
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text }]);
    setInput("");
    setIsThinking(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/interaction/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await response.json();
      
      // Fallback extraction logic depending on LLM output shape
      let reply = "System response received.";
      if (data?.data?.ai_response?.response_text) {
        reply = data.data.ai_response.response_text;
      } else if (data?.data?.engine_result?.data?.systemPrompt) {
        reply = "Prompt generated: " + data.data.engine_result.data.systemPrompt.substring(0, 100) + "...";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "fp",
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now()), role: "fp", text: "Connection to FP-OS core failed. Ensure backend is running on port 8000." },
      ]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const isInitial = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative bg-black text-text-primary">
      {/* Chat Header */}
      <header className="flex items-center justify-between gap-2 px-3 md:px-6 h-14 border-b border-border/20">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden size-9 grid place-items-center rounded-full hover:bg-white/5 text-text-primary cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          
          <button className="flex items-center gap-1.5 px-2 h-9 rounded-full hover:bg-white/5 transition cursor-pointer">
            <span className="font-display text-[17px] font-medium">FP</span>
            <span className="font-display text-[17px] text-text-secondary">Flash</span>
            <svg
              className="size-4 text-text-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenVault}
            className="size-9 grid place-items-center rounded-full hover:bg-white/5 text-text-primary transition cursor-pointer"
            title="Open vault"
          >
            <PenLine className="size-[18px]" />
          </button>
          <button className="size-9 grid place-items-center rounded-full hover:bg-white/5 text-text-primary transition cursor-pointer">
            <Ellipsis className="size-5" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8">
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          {isInitial && (
            <div className="pt-16 md:pt-24 animate-fade-up">
              <h2 className="font-display text-[44px] md:text-6xl font-medium tracking-tight leading-[1.05]">
                <span className="shimmer-text">Good evening.</span>
              </h2>
              <p className="mt-3 text-text-secondary text-lg">
                What are we executing today?
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} msg={msg} />
          ))}

          {isThinking && (
            <div className="animate-fade-up">
              <span className="shimmer-text text-[15px]">Thinking…</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Box */}
      <div className="px-3 md:px-8 pb-5 pt-2">
        <div className="max-w-2xl mx-auto">
          {isInitial && (
            <div className="flex flex-wrap gap-2 mb-3">
              {CHAT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="px-3.5 py-2 text-[13px] rounded-full border border-border bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative rounded-[28px] bg-[var(--bg-bubble)] border border-transparent focus-within:border-white/15 transition-colors"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask FP"
              rows={1}
              className="w-full bg-transparent outline-none resize-none px-5 pt-4 pb-1 text-[16px] placeholder:text-text-secondary max-h-[200px]"
            />
            
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <button
                type="button"
                className="size-10 grid place-items-center rounded-full text-text-primary hover:bg-white/5 transition cursor-pointer"
                aria-label="Attach"
              >
                <Paperclip className="size-5" />
              </button>
              
              {input.trim() ? (
                <button
                  type="submit"
                  disabled={isThinking}
                  className="size-10 grid place-items-center rounded-full bg-text-primary text-black hover:scale-105 active:scale-95 transition cursor-pointer"
                  aria-label="Send"
                >
                  <ArrowUp className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  className="size-10 grid place-items-center rounded-full text-text-primary hover:bg-white/5 transition cursor-pointer"
                  aria-label="Voice"
                >
                  <Mic className="size-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatMessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="animate-fade-up flex justify-end">
        <div className="max-w-[85%] rounded-[22px] bg-[var(--bg-bubble)] px-5 py-3 text-[16px] leading-relaxed">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up pt-2">
      <p className="text-[16px] leading-[1.65] text-text-primary whitespace-pre-wrap">
        {msg.text}
      </p>
    </div>
  );
}
