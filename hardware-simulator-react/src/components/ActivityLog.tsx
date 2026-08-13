import {
  BookText,
  CheckCircle2,
  Circle,
  AlertCircle,
  WifiOff,
  ToggleRight,
  PenSquare,
} from 'lucide-react';
import type { ActivityLogEntry, LogIconType } from '../types';

interface ActivityLogProps {
  log: ActivityLogEntry[];
  onClear: () => void;
}

const LOG_ICONS: Record<LogIconType, { icon: React.ReactNode; bg: string; color: string }> = {
  on: {
    icon: <CheckCircle2 size={14} />,
    bg: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
  },
  off: {
    icon: <Circle size={14} />,
    bg: 'rgba(100, 116, 139, 0.15)',
    color: '#64748b',
  },
  error: {
    icon: <AlertCircle size={14} />,
    bg: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  disconnected: {
    icon: <WifiOff size={14} />,
    bg: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
  },
  switch: {
    icon: <ToggleRight size={14} />,
    bg: 'rgba(139, 92, 246, 0.15)',
    color: '#8b5cf6',
  },
};

export function ActivityLog({ log, onClear }: ActivityLogProps) {
  return (
    <aside className="sticky top-5">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="text-[0.85rem] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <BookText size={16} className="text-[var(--text-secondary)]" />
            Activity Log
            <span
              className="text-[0.7rem] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}
            >
              {log.length}
            </span>
          </div>
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded-md text-[0.7rem] cursor-pointer transition-all duration-200 hover:border-[var(--border-glass-hover)] hover:text-[var(--text-secondary)]"
            style={{
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: 'var(--text-muted)',
            }}
          >
            Clear
          </button>
        </div>

        {/* Log entries */}
        <div className="max-h-[calc(100vh-300px)] min-h-[400px] overflow-y-auto p-2">
          {log.length === 0 ? (
            <div className="py-10 px-5 text-center text-[var(--text-muted)] text-[0.85rem]">
              <div className="text-4xl mb-2 opacity-40">
                <BookText size={32} className="mx-auto" />
              </div>
              <div>No activity yet</div>
              <div className="text-[0.75rem] mt-1 text-[var(--text-dim)]">
                Device state changes will appear here
              </div>
            </div>
          ) : (
            log.map((entry, idx) => {
              const iconConfig = LOG_ICONS[entry.iconType] || {
                icon: <PenSquare size={14} />,
                bg: 'rgba(100, 116, 139, 0.15)',
                color: '#64748b',
              };

              return (
                <div
                  key={idx}
                  className="flex gap-2.5 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-white/[0.03] animate-[slideIn_0.3s_ease]"
                >
                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: iconConfig.bg, color: iconConfig.color }}
                  >
                    {iconConfig.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8rem] font-semibold text-[var(--text-primary)] leading-tight">
                      {entry.deviceName}
                    </div>
                    <div className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
                      {entry.message}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="font-mono text-[0.68rem] text-[var(--text-dim)] whitespace-nowrap pt-0.5 min-w-[55px]">
                    {entry.time}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
