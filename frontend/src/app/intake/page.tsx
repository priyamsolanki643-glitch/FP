"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

// Mock Intake Script
const INTAKE_QUESTIONS = [
  { key: "geo", text: "Where are you operating from? (City, Country)" },
  { key: "capital", text: "What is your current liquid capital available for this goal?" },
  { key: "hours", text: "How many hours of unbroken cognitive focus can you commit daily?" },
  { key: "ego", text: "Why does this matter? What is the actual leverage point driving you?" }
];

export default function IntakeTerminal() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = INTAKE_QUESTIONS[currentIndex];

  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing, currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || isLocked) return;

    const answer = inputValue;
    setInputValue("");
    setHistory((prev) => [...prev, { q: currentQuestion.text, a: answer }]);
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      if (currentIndex < INTAKE_QUESTIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsLocked(true);
        setTimeout(() => {
          router.push("/gate");
        }, 2500);
      }
    }, 1500); // 1.5s processing pause
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* LEFT 2/3: Conversation Area */}
      <div className="w-2/3 h-full flex flex-col p-12 overflow-y-auto border-r border-border scrollbar-none">
        
        <div className="flex-1 flex flex-col justify-end max-w-3xl">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 border-b border-border/50 pb-8"
              >
                <p className="font-sans text-lg mb-4 text-foreground">{item.q}</p>
                <p className="font-sans text-lg text-muted-foreground opacity-70">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLocked && currentQuestion && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <p className="font-sans text-2xl font-medium mb-6">
                {currentQuestion.text}
              </p>
              
              {!isProcessing ? (
                <form onSubmit={handleSubmit}>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 pb-2 text-xl font-sans focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    placeholder="Enter your response..."
                  />
                </form>
              ) : (
                <div className="h-10 flex items-end">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="font-mono text-sm text-muted-foreground"
                  >
                    Processing constraint vector...
                  </motion.p>
                </div>
              )}
            </motion.div>
          )}

          {isLocked && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12"
            >
              <p className="font-mono text-primary text-lg tracking-wider">
                Reality profile locked. Running survivability audit.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT 1/3: Constraint Matrix Panel */}
      <div className="w-1/3 h-full bg-card p-12 flex flex-col">
        <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-12">
          Building your reality profile
        </h3>

        <div className="space-y-6">
          {INTAKE_QUESTIONS.map((q, idx) => {
            const isMapped = idx < currentIndex || isLocked;
            const isPending = idx === currentIndex && !isLocked;

            return (
              <div key={q.key} className="flex justify-between items-center border-b border-border/50 pb-4">
                <span className="font-mono text-sm text-foreground capitalize">
                  {q.key} Vector
                </span>
                
                <div className="flex items-center space-x-2">
                  {isMapped ? (
                    <span className="font-mono text-xs text-status-positive">MAPPED</span>
                  ) : isPending ? (
                    <>
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-status-warning"
                      />
                      <span className="font-mono text-xs text-status-warning">PENDING</span>
                    </>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">AWAITING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
