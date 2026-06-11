"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase/client";
import { X, ArrowRight, Loader2, KeyRound } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ onClose, onSuccess, initialMode = "signup" }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode === "signup" && !name.trim())) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          shouldCreateUser: true,
          data: mode === "signup" ? { full_name: name.trim() } : undefined
        },
      });
      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send sequence.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid decryption sequence.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin + '/' }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Absolute Void Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/95 backdrop-blur-sm transition-opacity duration-700"
      />

      <style>{`
        /* The Gate Core Aesthetic */
        .gate-modal {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: #000000;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0px; /* Monolithic sharp cut */
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 100px rgba(0,0,0,1);
        }
        
        /* Optical Scanner Sweep */
        .scanner-line {
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,1);
          box-shadow: 0 0 15px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4);
          opacity: 0;
          pointer-events: none;
          z-index: 50;
        }
        .gate-modal.mounted .scanner-line {
          animation: scanDown 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes scanDown {
          0% { top: -10px; opacity: 1; }
          90% { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Typography */
        .gate-heading {
          font-weight: 300;
          font-size: 13px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 32px;
          animation: glitchText 2s infinite alternate;
        }

        /* Glowing Laser Inputs */
        .gate-input-wrapper {
          position: relative;
          margin-bottom: 24px;
        }
        .gate-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 18px;
          font-weight: 200;
          letter-spacing: 0.05em;
          padding: 8px 0;
          caret-color: #ffffff;
        }
        .gate-input::placeholder {
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 0.2em;
        }
        .gate-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.15);
        }
        .gate-line-active {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 1px;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gate-input:focus ~ .gate-line-active {
          width: 100%;
        }

        /* The Monolithic Core Button */
        .btn-gate-core {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 18px 24px;
          margin-top: 16px;
          background: #ffffff;
          color: #000000;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          outline: none;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-gate-core:hover {
          transform: scale(0.98);
        }
        .btn-gate-core:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .btn-gate-core .arrow-icon {
          transition: transform 0.3s ease;
        }
        .btn-gate-core:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* OTP Decryption UI */
        .otp-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .otp-input {
          width: 48px;
          height: 60px;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(255,255,255,0.1);
          color: #ffffff;
          font-family: monospace;
          font-size: 24px;
          text-align: center;
          outline: none;
          transition: border-color 0.3s ease, text-shadow 0.3s ease;
        }
        .otp-input:focus {
          border-bottom-color: #ffffff;
          text-shadow: 0 0 10px rgba(255,255,255,0.8);
        }

        /* OAuth Buttons */
        .btn-oauth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-oauth:hover {
          border-color: rgba(255,255,255,0.5);
          color: #ffffff;
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 32px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.05);
        }
        .divider-text {
          padding: 0 16px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      `}</style>

      <div
        className={`gate-modal ${mounted ? "mounted opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="scanner-line"></div>

        <div className="flex justify-between items-center p-6 pb-0">
          <div className="flex items-center gap-3">
            <KeyRound className="size-4 text-white/30" />
            <span className="text-[10px] text-white/30 tracking-[0.3em] uppercase">Security Protocol</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-8 pt-10">
          <h2 className="gate-heading">
            {step === "otp" ? "Awaiting Decryption" : (mode === "signup" ? "Initialize Designation" : "Authenticate Identity")}
          </h2>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <div className="gate-input-wrapper">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Designation"
                    className="gate-input"
                    required
                    autoFocus
                    spellCheck="false"
                  />
                  <div className="gate-line"></div>
                  <div className="gate-line-active"></div>
                </div>
              )}
              <div className="gate-input-wrapper">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Neural Access Point (Email)"
                  className="gate-input"
                  required
                  autoFocus={mode === "login"}
                  spellCheck="false"
                />
                <div className="gate-line"></div>
                <div className="gate-line-active"></div>
              </div>
              
              {error && <div className="text-[#ff3333] text-[11px] uppercase tracking-widest mb-4">{error}</div>}
              
              <button 
                type="submit"
                disabled={isLoading}
                className="btn-gate-core"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Establish Link"}
                {!isLoading && <ArrowRight className="size-4 arrow-icon" />}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit}>
              <div className="text-[12px] text-white/40 mb-6 font-light">
                Sequence transmitted to {email}
              </div>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-input"
                    autoFocus={idx === 0}
                    required
                  />
                ))}
              </div>
              {error && <div className="text-[#ff3333] text-[11px] uppercase tracking-widest mb-4">{error}</div>}
              <button 
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="btn-gate-core"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Verify Sequence"}
                {!isLoading && <ArrowRight className="size-4 arrow-icon" />}
              </button>
              <button 
                type="button"
                onClick={() => setStep("email")}
                className="mt-6 text-white/30 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors block text-center w-full"
              >
                Abort & Return
              </button>
            </form>
          )}

          {step === "email" && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">External Nodes</span>
                <div className="divider-line" />
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="btn-oauth"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sync Google Node
                </button>
                <button 
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={isLoading}
                  className="btn-oauth"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Sync GitHub Node
                </button>
              </div>

              <div className="mt-8 text-center">
                <button 
                  type="button"
                  onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }}
                  className="text-white/40 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  {mode === "signup" ? "[ Switch to Authentication ]" : "[ Switch to Initialization ]"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
