import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setLogs([
      'INITIATING MATRIX MODE...',
      'BYPASSING BOT DETECTORS? NEGATIVE: WE RESPECT TOS! 🛡️',
      'FETCHING PUBLIC REMOTIVE API...',
      'RETRIES WITH EXPONENTIAL BACKOFF... INITIALIZED',
      'DETERMINISTIC HASH GENERATOR... OK',
      'SYSTEM STATUS: 100% ETHICAL & RESILIENT INGESTION'
    ]);

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      const randomLogs = [
        `[${timestamp}] [TELEMETRY] Remotive Feed Heartbeat: 200 OK (0.14s)`,
        `[${timestamp}] [DEDUP] Hash check SHA256: 0 collisions detected`,
        `[${timestamp}] [RATE LIMIT] Rate-limit quota remaining: 99.8%`,
        `[${timestamp}] [RESILIENCE] HTTP 429 backoff simulator: Ready`,
        `[${timestamp}] [BONUS] Konami Code Activated! 🎉`
      ];
      const nextLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setLogs((prev) => [...prev.slice(-10), nextLog]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-green-500/40 bg-slate-950/90 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="p-3 border-b border-green-500/30 bg-slate-900/80 flex items-center justify-between text-green-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="font-bold tracking-wider uppercase text-[11px]">Acdyon Ingestion Cyber-Terminal (Bonus)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:text-white text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Log Area */}
        <div className="p-4 h-64 overflow-y-auto bg-black/90 text-green-400 space-y-1.5 leading-relaxed">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-green-600 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-green-500 animate-pulse">
            <span>&gt;</span>
            <span className="w-2 h-4 bg-green-400 inline-block"></span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-green-500/30 bg-slate-900/90 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Sparkles className="w-4 h-4" />
            <span>Bonus Round Unlocked!</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/40 font-semibold hover:bg-green-500/30 transition-all text-xs"
          >
            Exit Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
