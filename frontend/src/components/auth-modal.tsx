"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase/client";
import { X, ArrowRight, Mail, Smartphone, Fingerprint, KeyRound, Loader2 } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier,
      });
      if (error) throw error;

      setIsLoading(false);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/',
        }
      });
      if (error) throw error;
      // It will redirect the page, so no need to stop loading or call onSuccess here.
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (value && index === 5) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: identifier,
        token: code,
        type: 'email',
      });
      if (error) throw error;
      
      setIsLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid execution code.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Deep blurred backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(24px) saturate(120%)",
          WebkitBackdropFilter: "blur(24px) saturate(120%)",
        }}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[420px] bg-[#000000] border border-[#18181b] rounded-[24px] overflow-hidden flex flex-col transition-all duration-[400ms] ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.96]"
        }`}
        style={{
          boxShadow: "0 30px 80px -20px rgba(0,0,0,1)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <div className="size-8 rounded-full bg-white/5 border border-white/10 grid place-items-center">
            <Fingerprint className="size-4 text-[#a1a1aa]" />
          </div>
          <button 
            onClick={onClose}
            className="text-[#52525b] hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 md:pb-8">
          
          <div className="mb-8 mt-2">
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
              {step === "identifier" ? "Welcome." : "Verify your identity."}
            </h2>
            <p className="text-[14px] text-[#a1a1aa] leading-relaxed">
              {step === "identifier" 
                ? "Sign in or create an account to start executing." 
                : <>We sent a 6-digit one-time code to <span className="text-white font-medium">{identifier}</span></>}
            </p>
          </div>

          {step === "identifier" && (
            <div className="animate-message-reveal">
              <form onSubmit={handleIdentifierSubmit} className="flex flex-col gap-4">
                <div className="relative flex items-center bg-transparent border-b border-[#27272a] focus-within:border-[#00ff66] transition-colors pb-3">
                  <Mail className="size-4 text-[#52525b] absolute left-1" />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or phone number"
                    className="w-full bg-transparent border-none outline-none text-white text-[15px] pl-8 placeholder:text-[#52525b]"
                    autoFocus
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!identifier || isLoading}
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-[#00ff66] text-black font-semibold py-3.5 rounded-xl hover:bg-[#33ff85] transition-all disabled:opacity-50 disabled:hover:bg-[#00ff66] cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]"
                >
                  {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Continue"}
                  {!isLoading && <ArrowRight className="size-4" />}
                </button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="h-[1px] flex-1 bg-[#18181b]" />
                <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-widest">Or connect via</span>
                <div className="h-[1px] flex-1 bg-[#18181b]" />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleOAuthLogin('github')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 w-full bg-transparent text-zinc-500 hover:text-white font-medium py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : (
                    <svg className="size-4 text-zinc-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  )}
                  Continue with GitHub
                </button>
                <button 
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 w-full bg-transparent text-zinc-500 hover:text-white font-medium py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : (
                    <svg className="size-4 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="animate-message-reveal flex flex-col items-center">
              <div className="flex justify-center gap-2 md:gap-3 mb-8 mt-4 w-full">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{1}"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-10 h-12 md:w-12 md:h-14 bg-transparent border-b-2 border-[#27272a] focus:border-[#00ff66] focus:text-[#00ff66] focus:shadow-[0_4px_16px_rgba(0,255,102,0.15)] text-center text-2xl font-mono text-white outline-none transition-all ${digit ? 'border-[#00ff66]/50 text-[#00ff66]' : ''}`}
                  />
                ))}
              </div>

              {error && (
                <div className="w-full text-center mb-6 text-[#ff3333] text-[13px] font-mono tracking-wide animate-pulse">
                  {error}
                </div>
              )}

              <button 
                onClick={() => verifyOtp(otp.join(""))}
                disabled={otp.join("").length !== 6 || isLoading}
                className="flex items-center justify-center gap-2 w-full bg-[#00ff66] text-black font-semibold py-3.5 rounded-xl hover:bg-[#33ff85] transition-all disabled:opacity-50 disabled:hover:bg-[#00ff66] cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]"
              >
                {isLoading ? <Loader2 className="size-5 text-black animate-spin" /> : <><KeyRound className="size-4" /> Verify code</>}
              </button>

              <div className="mt-8 flex items-center justify-center text-[13px] font-mono text-[#52525b]">
                <button 
                  onClick={() => { setStep("identifier"); setOtp(["","","","","",""]); setError(null); }}
                  className="hover:text-white transition-colors"
                >
                  Change identifier
                </button>
                <span className="mx-3 text-[#27272a]">|</span>
                <span>Resend in 59s</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
