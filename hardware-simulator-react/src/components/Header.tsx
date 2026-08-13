import { Home } from 'lucide-react';
import type { Device } from '../types';

interface HeaderProps {
  devices: Record<string, Device>;
  isConnected: boolean;
}

export function Header({ devices, isConnected }: HeaderProps) {
  const total = Object.keys(devices).length;
  const onCount = Object.values(devices).filter((d) => d.state === 'ON').length;

  return (
    <header className="flex items-center justify-between py-5 border-b border-white/[0.08] mb-7">
      <div className="flex items-center gap-3.5">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[22px]"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
          }}
        >
          <Home size={22} />
        </div>

        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hardware Simulator
          </h1>
          <p className="text-[0.8rem] text-[var(--text-muted)] font-normal tracking-wide">
            Smart Home Monitoring & Control System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Device Counter */}
        <div
          className="px-4 py-2 rounded-2xl text-[0.8rem] text-[var(--text-secondary)] font-medium"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <strong className="text-[var(--text-primary)] font-bold">{onCount}</strong> ON /{' '}
          <strong className="text-[var(--text-primary)] font-bold">{total}</strong> Total
        </div>

        {/* Connection Status */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[0.8rem] font-medium transition-all duration-300"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'animate-[pulse-dot_2s_infinite]' : ''}`}
            style={{
              background: isConnected ? '#22c55e' : '#ef4444',
              boxShadow: isConnected
                ? '0 0 8px rgba(34, 197, 94, 0.4)'
                : '0 0 8px rgba(239, 68, 68, 0.4)',
            }}
          />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}
