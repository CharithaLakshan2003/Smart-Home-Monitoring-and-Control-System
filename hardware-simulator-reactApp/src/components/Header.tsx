import { Wifi, WifiOff } from 'lucide-react';
import type { Device } from '../types';

interface HeaderProps {
  devices: Record<string, Device>;
  isConnected: boolean;
}

export function Header({ devices, isConnected }: HeaderProps) {
  const total = Object.keys(devices).length;
  const onCount = Object.values(devices).filter((d) => d.state === 'ON').length;

  return (
    <header className="flex items-center justify-end gap-10 px-14 py-12 shrink-0">

      {/* Device Counter */}
      <div className="flex items-center gap-4 px-6 py-3 rounded-full border border-[var(--border-glass)] bg-[var(--bg-glass)]">
        <span className="text-[0.8rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Active
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[1.1rem] font-bold text-white">{onCount}</span>
          <span className="text-[0.85rem] text-[var(--text-dim)]">/ {total}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 ${isConnected
          ? 'border-green-500/20 bg-green-500/10 text-green-400 shadow-[0_0_16px_rgba(34,197,94,0.1)]'
          : 'border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.1)]'
        }`}>
        {isConnected ? (
          <>
            <Wifi size={14} className="animate-pulse" />
            <span className="text-[0.8rem] font-bold tracking-wide uppercase">Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={14} />
            <span className="text-[0.8rem] font-bold tracking-wide uppercase">Offline</span>
          </>
        )}
      </div>

    </header>
  );
}
