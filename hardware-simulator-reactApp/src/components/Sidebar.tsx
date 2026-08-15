import { useState } from 'react';
import { Map, Grid, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Device, Floor } from '../types';

interface SidebarProps {
  floors: Record<string, Floor>;
  devices: Record<string, Device>;
  selectedFloorId: string | null;
  onSelectFloor: (floorId: string | null) => void;
}

export function Sidebar({ floors, devices, selectedFloorId, onSelectFloor }: SidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const floorList = Object.values(floors);
  const totalDevices = Object.keys(devices).length;

  return (
    <aside 
      className={`h-full shrink-0 border-r border-[var(--border-glass)] bg-[var(--bg-sidebar)] flex flex-col pt-14 pb-12 hidden md:flex transition-all duration-300 relative ${
        isMinimized ? 'w-[100px]' : 'w-[340px]'
      }`}
    >
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-4 top-12 w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-glass-hover)] transition-all z-50 shadow-lg"
      >
        {isMinimized ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Brand */}
      <div className={`mb-20 flex items-center gap-6 transition-all duration-300 ${isMinimized ? 'px-7' : 'px-14'}`}>
        <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_24px_rgba(59,130,246,0.4)] shrink-0">
          <Home size={26} color="#fff" />
        </div>
        {!isMinimized && (
          <div className="whitespace-nowrap overflow-hidden">
            <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              Obsidian
            </div>
            <div className="text-[0.7rem] uppercase tracking-[0.1em] text-[var(--text-dim)] font-semibold mt-0.5">
              Simulator
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${isMinimized ? 'px-5' : 'px-10'}`}>
        {!isMinimized && (
          <div className="text-[0.75rem] font-bold text-[var(--text-dim)] uppercase tracking-wider mb-8 px-6 whitespace-nowrap">
            Spaces
          </div>
        )}

        <nav className="flex flex-col gap-4">
          {/* All Floors */}
          <button
            onClick={() => onSelectFloor(null)}
            className={`flex items-center justify-between py-5 rounded-2xl transition-all duration-300 ${isMinimized ? 'px-4 justify-center' : 'px-7'} ${
              selectedFloorId === null 
                ? 'bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] text-blue-400' 
                : 'text-[var(--text-secondary)] border border-transparent hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
            title={isMinimized ? "All Devices" : undefined}
          >
            <div className="flex items-center gap-3">
              <Grid size={18} className={selectedFloorId === null ? 'text-blue-400' : 'text-[var(--text-dim)]'} />
              {!isMinimized && <span className="font-semibold text-[0.95rem] whitespace-nowrap">All Devices</span>}
            </div>
            {!isMinimized && (
              <span className={`text-[0.75rem] font-bold px-2.5 py-1 rounded-full ${
                selectedFloorId === null ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-[var(--text-muted)]'
              }`}>
                {totalDevices}
              </span>
            )}
          </button>

          {/* Individual Floors */}
          {floorList.map(floor => {
            const devCount = Object.values(devices).filter((d) => d.floorId === floor.id).length;
            const isActive = selectedFloorId === floor.id;
            
            return (
              <button
                key={floor.id}
                onClick={() => onSelectFloor(floor.id)}
                className={`flex items-center justify-between py-5 rounded-2xl transition-all duration-300 ${isMinimized ? 'px-4 justify-center' : 'px-7'} ${
                  isActive 
                    ? 'bg-purple-500/10 border border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)] text-purple-400' 
                    : 'text-[var(--text-secondary)] border border-transparent hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`}
                title={isMinimized ? (floor.name || 'Unnamed Floor') : undefined}
              >
                <div className="flex items-center gap-3">
                  <Map size={18} className={isActive ? 'text-purple-400' : 'text-[var(--text-dim)]'} />
                  {!isMinimized && <span className="font-semibold text-[0.95rem] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] text-left">{floor.name || 'Unnamed Floor'}</span>}
                </div>
                {!isMinimized && (
                  <span className={`text-[0.75rem] font-bold px-2.5 py-1 rounded-full ${
                    isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-[var(--text-muted)]'
                  }`}>
                    {devCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

    </aside>
  );
}
