import { useRef, useCallback } from 'react';
import { Home } from 'lucide-react';
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

  // Get filtered & sorted devices
  let deviceList = Object.values(devices);

  if (selectedFloorId) {
    deviceList = deviceList.filter((d) => d.floorId === selectedFloorId);
  }

  // Sort by type then label
  deviceList.sort((a, b) => {
    const aIdx = getDeviceTypeSortOrder(a.type || 'OUTLET');
    const bIdx = getDeviceTypeSortOrder(b.type || 'OUTLET');
    if (aIdx !== bIdx) return aIdx - bIdx;
    return (a.label || '').localeCompare(b.label || '');
  });

  // Scroll to card handler (for floor plan clicks)
  const handleDeviceClick = useCallback((deviceId: string) => {
    const el = cardRefs.current[deviceId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight effect
      el.style.outline = '2px solid rgba(59, 130, 246, 0.6)';
      el.style.outlineOffset = '2px';
      setTimeout(() => {
        el.style.outline = 'none';
        el.style.outlineOffset = '0';
      }, 2000);
    }
  }, []);

  // Selected floor data for floor plan
  const selectedFloor = selectedFloorId ? floors[selectedFloorId] : null;

  return (
    <section className="min-w-0">
      {/* Floor Plan View — shown when a specific floor is selected */}
      {selectedFloor && (
        <FloorPlanView
          floor={selectedFloor}
          devices={deviceList}
          onDeviceClick={handleDeviceClick}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-[0.08em] font-semibold">
          Simulated Appliances
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div
            className="w-10 h-10 rounded-full border-3 border-[var(--border-glass)] border-t-[#3b82f6] animate-[spin_0.8s_linear_infinite] mx-auto mb-4"
          />
          <div className="text-[var(--text-muted)] text-[0.85rem]">Connecting to Firebase…</div>
        </div>
      ) : deviceList.length === 0 ? (
        <div className="text-center py-16 col-span-full">
          <div className="text-5xl mb-3 opacity-30">
            <Home size={48} className="mx-auto" />
          </div>
          <div className="text-[1.1rem] font-semibold text-[var(--text-secondary)] mb-1.5">
            No devices found
          </div>
          <div className="text-[0.85rem] text-[var(--text-muted)] max-w-[400px] mx-auto">
            {selectedFloorId
              ? 'No devices are assigned to this floor. Add devices from the mobile app.'
              : 'No devices in the system yet. Add devices from the mobile app to see them here.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
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
    </section>
  );
}
