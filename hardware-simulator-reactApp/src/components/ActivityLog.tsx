import { BookText, Activity, TerminalSquare, AlertCircle, WifiOff } from 'lucide-react';
import type { ActivityLogEntry, LogIconType } from '../types';

interface ActivityLogProps {
  log: ActivityLogEntry[];
  onClear: () => void;
}

const LOG_ICONS: Record<LogIconType, { icon: React.ReactNode; bg: string; color: string }> = {
  on: { icon: <Activity size={16} />, bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
  off: { icon: <TerminalSquare size={16} />, bg: 'rgba(255, 255, 255, 0.05)', color: '#a1a1aa' },
  error: { icon: <AlertCircle size={16} />, bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
  disconnected: { icon: <WifiOff size={16} />, bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
  switch: { icon: <Activity size={16} />, bg: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' },
};

export function ActivityLog({ log, onClear }: ActivityLogProps) {
  return (
    <aside className="h-full flex flex-col bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-subtle)] overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <BookText size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-[1rem] font-bold text-white leading-tight">System Log</h2>
            <div className="text-[0.7rem] text-[var(--text-muted)] font-medium">Real-time Events</div>
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg border border-[var(--border-glass)] text-[0.75rem] font-bold text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
        >
          CLEAR
        </button>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {log.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <BookText size={48} className="mb-4 text-[var(--text-muted)]" />
            <span className="text-[0.9rem] font-medium text-[var(--text-secondary)]">No recent activity</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {log.map((entry, idx) => {
              const iconConfig = LOG_ICONS[entry.iconType] || LOG_ICONS.off;

              return (
                <div
                  key={idx}
                  className="flex gap-4 p-4 rounded-[16px] bg-white/[0.02] border border-[var(--border-subtle)] transition-all hover:bg-white/[0.04] animate-slide-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-inner"
                    style={{ background: iconConfig.bg, color: iconConfig.color }}
                  >
                    {iconConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[0.9rem] font-bold text-white truncate">
                        {entry.deviceName}
                      </span>
                      <span className="text-[0.65rem] font-mono text-[var(--text-muted)] pt-0.5 whitespace-nowrap">
                        {entry.time}
                      </span>
                    </div>
                    <span className="text-[0.8rem] text-[var(--text-secondary)] mt-0.5 leading-snug">
                      {entry.message}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
