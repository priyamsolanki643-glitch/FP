"use client";

import { useState } from "react";
import { Plus, Search, Compass, Archive, HelpCircle, ChevronDown, LogOut } from "lucide-react";

interface SidebarProps {
  onOpenVault: () => void;
  onSignOut: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ onOpenVault, onSignOut, isOpen, setIsOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("trajectory");
  const [touchStart, setTouchStart] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchThreads = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/threads`, {
        headers: { "Authorization": "Bearer test-user" }
      });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        // Group by 'Today', 'Yesterday', etc. based on updated_at
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const grouped = [
          { group: "Today", chats: [] as any[] },
          { group: "Yesterday", chats: [] as any[] },
          { group: "Previous 7 Days", chats: [] as any[] },
          { group: "Older", chats: [] as any[] }
        ];

        data.data.forEach((t: any) => {
          const tDate = new Date(t.updated_at);
          if (tDate >= today) grouped[0].chats.push(t);
          else if (tDate >= yesterday) grouped[1].chats.push(t);
          else if (tDate >= last7Days) grouped[2].chats.push(t);
          else grouped[3].chats.push(t);
        });

        setHistoryData(grouped.filter(g => g.chats.length > 0));
      }
    } catch (err) {
      console.error("Failed to load threads", err);
    }
  };

  useEffect(() => {
    fetchThreads();
    window.addEventListener('refresh-sidebar', fetchThreads);
    return () => window.removeEventListener('refresh-sidebar', fetchThreads);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart - e.changedTouches[0].clientX > 50) setIsOpen(false);
  };

  return (
    <>
      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col shrink-0 h-screen transition-all duration-300 bg-black overflow-hidden ${
          isOpen ? "w-[260px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"
        }`}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { scrollbar-width: none; }
        `}</style>

        {/* ── Top Brand Header ── */}
        <div className="p-4 shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-3">
              {/* FP Logo: Black circle, white dot */}
              <div className="size-5 rounded-full bg-white flex items-center justify-center shrink-0">
                <div className="size-2 rounded-full bg-black" />
              </div>
              {isOpen && (
                <span className="font-sans font-bold text-[15px] text-white tracking-tight">
                  FP
                </span>
              )}
            </div>
            {isOpen && (
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#666666] hover:text-white transition-colors cursor-pointer p-1"
              >
                {/* 3 dots icon */}
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            )}
          </div>

          {/* New Thread Button */}
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('new-thread'));
              setIsOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full bg-white text-black font-medium py-2 px-4 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-[13px] shrink-0"
          >
            <Plus className="size-4" />
            {isOpen && <span>New thread</span>}
          </button>
        </div>

        {/* ── Navigation Links ── */}
        <div className="px-3 shrink-0 flex flex-col gap-0.5">
          {/* Search */}
          {isOpen ? (
            isSearchActive ? (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg">
                <Search className="size-4 text-[#666666] shrink-0" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search chats..." 
                  className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#666666]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchActive(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchActive(false)}
                />
              </div>
            ) : (
              <div 
                onClick={() => setIsSearchActive(true)}
                className="flex items-center justify-between px-3 py-2 text-[#a1a1aa] hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-[13px]"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="size-4 text-[#666666]" />
                  <span>Search</span>
                </div>
              </div>
            )
          ) : (
            <button className="size-10 mx-auto grid place-items-center rounded-xl text-[#a1a1aa] hover:text-white hover:bg-white/5 cursor-pointer">
              <Search className="size-4" />
            </button>
          )}

          {/* Vault */}
          <button
            onClick={() => {
              setActiveItem("vault");
              onOpenVault();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-[13px] transition-colors ${
              activeItem === "vault"
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : "text-[#a1a1aa] hover:bg-white/5 hover:text-[#22c55e]"
            } ${!isOpen ? "justify-center" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Archive className="size-4 shrink-0" />
              {isOpen && <span className="font-medium">Vault</span>}
            </div>
            {isOpen && <span className={`text-[10px] font-mono ${activeItem === "vault" ? "text-[#22c55e]/70" : "text-[#52525b]"}`}>2x tap</span>}
          </button>
        </div>

        {/* ── Scrollable History List ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 flex flex-col gap-4 min-h-0">
          {isOpen && (
            <>
              {/* History List */}
              {(() => {
                const filteredHistory = historyData.map(g => ({
                  ...g,
                  chats: g.chats.filter((c: any) => c?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                })).filter(g => g.chats.length > 0);

                if (filteredHistory.length === 0) {
                  return (
                    <div className="px-3 py-4 text-center text-[#666666] text-[13px]">
                      No chats found.
                    </div>
                  );
                }

                return filteredHistory.map((group, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#666666] tracking-wider uppercase px-3 mb-1">
                      {group.group}
                    </div>
                    {group.chats.map((chat: any, j: number) => (
                      <button 
                        key={j} 
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('load-thread', { detail: { threadId: chat.id } }));
                          if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className="w-full text-left py-1.5 px-3 rounded-lg text-[#a1a1aa] hover:text-white transition-colors text-[13px] truncate cursor-pointer block"
                      >
                        {chat.title}
                      </button>
                    ))}
                  </div>
                ));
              })()}
            </>
          )}
        </div>

        {/* ── Footer / Upgrade / Profile ── */}
        <div className="p-3 bg-black shrink-0 flex flex-col gap-3">
          
          {/* User profile row */}
          <div className="relative">
            {isSignOutOpen && isOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-[#000000] border border-[#18181b] rounded-xl p-1 shadow-2xl animate-message-reveal z-50">
                <button 
                  onClick={onSignOut}
                  className="flex items-center justify-center gap-2 w-full text-center py-2.5 text-[#ff3333] hover:bg-[#ff3333]/10 font-medium text-[13px] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsSignOutOpen(!isSignOutOpen)}
              className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Profile letter avatar */}
                <div className="size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-white">U</span>
                </div>
                {isOpen && (
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="font-sans text-[12px] text-white font-semibold truncate leading-tight">
                      Operator
                    </span>
                    <span className="font-sans text-[10px] text-[#666666] mt-0.5 leading-none">
                      Free plan
                    </span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
