import { Grid3x3 } from 'lucide-react';
import type { Device, Floor } from '../types';
import { DeviceGridBadge } from './DeviceGridBadge';
import { FloorPlanLegend } from './FloorPlanLegend';
import { getPlanStyle } from '../utils/helpers';

interface FloorPlanViewProps {
  floor: Floor;
  devices: Device[];
  onDeviceClick: (deviceId: string) => void;
}

export function FloorPlanView({ floor, devices, onDeviceClick }: FloorPlanViewProps) {
  const gridRows = floor.gridRows || 4;
  const gridCols = floor.gridCols || 4;
  const planStyle = getPlanStyle(floor.imageUrl);

  return (
    <div
      className="rounded-2xl p-5 mb-6 animate-[fadeIn_0.3s_ease]"
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: planStyle.bgColor }}
          >
            <Grid3x3 size={16} className="text-white/80" />
          </div>
          <div>
            <h3 className="text-[0.95rem] font-semibold text-[var(--text-primary)]">
              {floor.name} — Floor Plan
            </h3>
            <p className="text-[0.72rem] text-[var(--text-muted)]">
              {gridRows} × {gridCols} Grid · {planStyle.name} Style · {devices.length} device{devices.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Plan */}
      <div
        className="rounded-xl p-3 aspect-[3/2] max-h-[400px]"
        style={{
          background: planStyle.bgColor,
          border: `1px solid ${planStyle.borderColor}`,
        }}
      >
        <div
          className="w-full h-full grid gap-1"
          style={{
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {Array.from({ length: gridRows * gridCols }, (_, idx) => {
            const row = Math.floor(idx / gridCols);
            const col = idx % gridCols;
            const device = devices.find((d) => d.gridX === col && d.gridY === row);

            return (
              <div
                key={`${row}-${col}`}
                className="flex items-center justify-center rounded-md transition-colors duration-200"
                style={{
                  border: `1px solid ${planStyle.gridLineColor}`,
                  background: device ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                }}
              >
                {device && (
                  <DeviceGridBadge
                    device={device}
                    onClick={() => onDeviceClick(device.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <FloorPlanLegend />
    </div>
  );
}
