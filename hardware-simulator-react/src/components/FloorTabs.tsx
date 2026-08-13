import type { Device, Floor } from '../types';

interface FloorTabsProps {
  floors: Record<string, Floor>;
  devices: Record<string, Device>;
  selectedFloorId: string | null;
  onSelectFloor: (floorId: string | null) => void;
}

export function FloorTabs({ floors, devices, selectedFloorId, onSelectFloor }: FloorTabsProps) {
  const floorList = Object.values(floors);
  const totalDevices = Object.keys(devices).length;

  return (
    <nav className="mb-6">
      <div className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-[0.08em] font-semibold mb-2.5">
        Floor Plans
      </div>
      <div className="flex gap-2 flex-wrap">
        {/* All Floors tab */}
        <button
          onClick={() => onSelectFloor(null)}
          className={`
            px-5 py-2.5 rounded-xl text-[0.85rem] font-medium cursor-pointer transition-all duration-250 relative overflow-hidden
            border border-dashed
            ${
              selectedFloorId === null
                ? 'text-[var(--text-primary)] border-[#3b82f6]'
                : 'text-[var(--text-secondary)] border-[var(--border-glass)] hover:border-[var(--border-glass-hover)] hover:text-[var(--text-primary)] hover:-translate-y-px'
            }
          `}
          style={{
            background:
              selectedFloorId === null
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15))'
                : 'rgba(255, 255, 255, 0.02)',
            boxShadow: selectedFloorId === null ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
          }}
        >
          All Floors
          <span
            className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[0.7rem] font-semibold ml-2"
            style={{
              background:
                selectedFloorId === null
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
              color: selectedFloorId === null ? '#93c5fd' : 'inherit',
            }}
          >
            {totalDevices}
          </span>
        </button>

        {/* Floor tabs */}
        {floorList.map((floor) => {
          const devCount = Object.values(devices).filter((d) => d.floorId === floor.id).length;
          const isActive = selectedFloorId === floor.id;

          return (
            <button
              key={floor.id}
              onClick={() => onSelectFloor(floor.id)}
              className={`
                px-5 py-2.5 rounded-xl text-[0.85rem] font-medium cursor-pointer transition-all duration-250 relative overflow-hidden
                ${
                  isActive
                    ? 'text-[var(--text-primary)] border border-[#3b82f6]'
                    : 'text-[var(--text-secondary)] border border-[var(--border-glass)] hover:border-[var(--border-glass-hover)] hover:text-[var(--text-primary)] hover:-translate-y-px'
                }
              `}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15))'
                  : 'var(--bg-glass)',
                boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
              }}
            >
              {floor.name || 'Unnamed Floor'}
              <span
                className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[0.7rem] font-semibold ml-2"
                style={{
                  background: isActive
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#93c5fd' : 'inherit',
                }}
              >
                {devCount}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
