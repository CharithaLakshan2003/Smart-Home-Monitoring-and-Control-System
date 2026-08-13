import { useRef, useCallback } from 'react';
import { Layers } from 'lucide-react';
import type { Device, Floor } from '../types';
import { DeviceCard } from './DeviceCard';
import { FloorPlanView } from './FloorPlanView';
import { getDeviceTypeSortOrder } from '../utils/helpers';

interface DeviceGridProps {
  devices: Record<string, Device>;
  floors: Record<string, Floor>;
  selectedFloorId: string | null;
  isLoading: boolean;
}

export function DeviceGrid({ devices, floors, selectedFloorId, isLoading }: DeviceGridProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  let deviceList = Object.values(devices);
  if (selectedFloorId) {
    deviceList = deviceList.filter((d) => d.floorId === selectedFloorId);
  }

  deviceList.sort((a, b) => {
    const aIdx = getDeviceTypeSortOrder(a.type || 'OUTLET');
    const bIdx = getDeviceTypeSortOrder(b.type || 'OUTLET');
    if (aIdx !== bIdx) return aIdx - bIdx;
    return (a.label || '').localeCompare(b.label || '');
  });

  const handleDeviceClick = useCallback((deviceId: string) => {
    const el = cardRefs.current[deviceId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.outline = '2px solid rgba(59, 130, 246, 0.8)';
      el.style.outlineOffset = '4px';
      setTimeout(() => {
        el.style.outline = 'none';
        el.style.outlineOffset = '0';
      }, 2000);
    }
  }, []);

  const selectedFloor = selectedFloorId ? floors[selectedFloorId] : null;

  return (
    <section className="min-w-0 flex flex-col gap-8">
      {selectedFloor && (
        <FloorPlanView
          floor={selectedFloor}
          devices={deviceList}
          onDeviceClick={handleDeviceClick}
        />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 sm:px-6 md:px-10 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Layers className="text-[var(--text-dim)]" size={20} />
          <h2 className="text-lg font-bold text-white tracking-wide">Device Controls</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin mb-4" />
            <div className="text-[var(--text-muted)] font-medium">Syncing with Hub...</div>
          </div>
        ) : deviceList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[var(--border-glass)] rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-dim)] mb-4">
              <Layers size={32} />
            </div>
            <div className="text-xl font-bold text-white mb-2">No Devices Active</div>
            <div className="text-[var(--text-muted)] max-w-sm">
              {selectedFloorId
                ? 'There are no devices mapped to this specific space.'
                : 'Your simulator environment is currently empty. Add devices via the mobile app.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {deviceList.map((device) => (
              <DeviceCard
                key={device.id}
                ref={(el) => { cardRefs.current[device.id] = el; }}
                device={device}
                floor={floors[device.floorId]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
