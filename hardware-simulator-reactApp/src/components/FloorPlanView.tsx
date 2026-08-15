import { Grid3x3 } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Device, Floor } from '../types';
import { DeviceGridBadge } from './DeviceGridBadge';
import { FloorPlanLegend } from './FloorPlanLegend';
import { getPlanStyle, roomForCell, ROOM_ZONES } from '../utils/helpers';

interface FloorPlanViewProps {
  floor: Floor;
  devices: Device[];
  onDeviceClick: (deviceId: string) => void;
}

const ALERT_COLOR = 'rgba(239, 68, 68, 1)';

function cellStyle(
  row: number,
  col: number,
  gridRows: number,
  gridCols: number,
  device: Device | undefined,
  isRooms: boolean,
  lineColor: string,
  wallColor: string,
): CSSProperties {
  const hasAlert = device && (device.state === 'ERROR' || device.state === 'DISCONNECTED');

  if (!isRooms) {
    return {
      border: `1px solid ${hasAlert ? ALERT_COLOR : lineColor}`,
      background: hasAlert
        ? 'rgba(239, 68, 68, 0.18)'
        : device
          ? 'rgba(255, 255, 255, 0.03)'
          : 'transparent',
    };
  }

  const room = roomForCell(row, col, gridRows, gridCols);
  const rightRoom = col + 1 < gridCols ? roomForCell(row, col + 1, gridRows, gridCols) : null;
  const bottomRoom = row + 1 < gridRows ? roomForCell(row + 1, col, gridRows, gridCols) : null;
  const rightWall = col === gridCols - 1 || room?.name !== rightRoom?.name;
  const bottomWall = row === gridRows - 1 || room?.name !== bottomRoom?.name;
  const thin = 1;
  const thick = 3;

  return {
    borderStyle: 'solid',
    borderTopWidth: row === 0 ? thick : thin,
    borderTopColor: row === 0 ? wallColor : lineColor,
    borderLeftWidth: col === 0 ? thick : thin,
    borderLeftColor: col === 0 ? wallColor : lineColor,
    borderRightWidth: rightWall ? thick : thin,
    borderRightColor: rightWall ? wallColor : lineColor,
    borderBottomWidth: bottomWall ? thick : thin,
    borderBottomColor: bottomWall ? wallColor : lineColor,
    background: hasAlert
      ? 'rgba(239, 68, 68, 0.18)'
      : room
        ? `${room.color}26`
        : 'transparent',
  };
}

export function FloorPlanView({ floor, devices, onDeviceClick }: FloorPlanViewProps) {
  const gridRows = floor.gridRows || 4;
  const gridCols = floor.gridCols || 4;
  const planStyle = getPlanStyle(floor.imageUrl);
  const isRooms = floor.imageUrl === 'plan_6';

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
        className="relative rounded-xl p-3 aspect-[3/2] max-h-[400px]"
        style={{
          background: planStyle.bgColor,
          border: `1px solid ${planStyle.borderColor}`,
        }}
      >
        <div
          className="w-full h-full grid"
          style={{
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: isRooms ? 0 : '0.25rem',
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
                style={cellStyle(
                  row,
                  col,
                  gridRows,
                  gridCols,
                  device,
                  isRooms,
                  planStyle.gridLineColor,
                  planStyle.borderColor,
                )}
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

        {/* Room labels */}
        {isRooms &&
          ROOM_ZONES.map((zone) => (
            <div
              key={zone.name}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${((zone.colStart + zone.colEnd) / 2) * 100}%`,
                top: `${((zone.rowStart + zone.rowEnd) / 2) * 100}%`,
                transform: 'translate(-50%, -50%)',
                color: 'rgba(230, 235, 245, 0.9)',
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {zone.name}
            </div>
          ))}
      </div>

      {/* Legend */}
      <FloorPlanLegend />
    </div>
  );
}
