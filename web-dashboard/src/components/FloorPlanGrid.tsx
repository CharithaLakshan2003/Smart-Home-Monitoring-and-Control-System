import { Map, LayoutGrid } from 'lucide-react';
import { DEVICE_TYPE_LABELS, type Device, type Floor } from '../types';
import { DeviceBadge } from './DeviceBadge';
import { DeviceIcon } from './DeviceIcon';
import { StatusChip } from './StatusChip';
import {
  STATE_COLORS,
  STATE_LABELS,
  isAlertState,
  getPlanStyle,
  getDeviceTypeSortOrder,
} from '../utils/helpers';

interface Props {
  floors: Floor[];
  devices: Device[];
  selectedFloorId: string | null;
  onSelectFloor: (id: string) => void;
  onSelectDevice: (device: Device) => void;
}

const LEGEND: Array<{ state: keyof typeof STATE_COLORS }> = [
  { state: 'ON' },
  { state: 'OFF' },
  { state: 'ERROR' },
  { state: 'DISCONNECTED' },
];

export function FloorPlanGrid({
  floors,
  devices,
  selectedFloorId,
  onSelectFloor,
  onSelectDevice,
}: Props) {
  const floor = floors.find((f) => f.id === selectedFloorId) ?? floors[0];

  const floorDevices = floor ? devices.filter((d) => d.floorId === floor.id) : [];
  const sorted = [...floorDevices].sort((a, b) => {
    const d = getDeviceTypeSortOrder(a.type) - getDeviceTypeSortOrder(b.type);
    return d !== 0 ? d : (a.label || '').localeCompare(b.label || '');
  });

  const rows = floor?.gridRows ?? 4;
  const cols = floor?.gridCols ?? 4;
  const plan = getPlanStyle(floor?.imageUrl ?? 'plan_1');

  const deviceAt = (col: number, row: number) =>
    floorDevices.filter((d) => d.gridX === col && d.gridY === row);

  return (
    <section
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <Map size={18} color="var(--text-secondary)" />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Floor Plan</h2>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {floors.map((f) => {
            const active = f.id === floor?.id;
            const count = devices.filter((d) => d.floorId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFloor(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 13px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--series-1)' : 'var(--border)'}`,
                  background: active ? 'rgba(0,188,212,0.14)' : 'var(--surface-2)',
                  color: active ? 'var(--series-1)' : 'var(--text-secondary)',
                }}
              >
                {f.name || 'Floor'}
                <span style={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!floor ? (
        <EmptyBlock label="No floors found in the database" />
      ) : (
        <div style={{ padding: 22 }}>
          {/* Plan grid */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              margin: '0 auto',
              aspectRatio: `${cols} / ${rows}`,
              borderRadius: 16,
              background: plan.bg,
              border: `1px solid ${plan.border}`,
              padding: 8,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: 6,
                width: '100%',
                height: '100%',
              }}
            >
              {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: cols }).map((_, col) => {
                  const cellDevices = deviceAt(col, row);
                  const hasAlert = cellDevices.some((d) => isAlertState(d.state));
                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        border: `1px solid ${
                          hasAlert ? 'rgba(208,59,59,0.7)' : `${plan.grid}55`
                        }`,
                        background: hasAlert ? 'rgba(208,59,59,0.16)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {cellDevices.length === 1 ? (
                        <DeviceBadge device={cellDevices[0]} size={38} onClick={onSelectDevice} />
                      ) : cellDevices.length > 1 ? (
                        <Cluster devices={cellDevices} onSelectDevice={onSelectDevice} />
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 20,
              marginTop: 20,
            }}
          >
            {LEGEND.map(({ state }) => (
              <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: STATE_COLORS[state],
                  }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  {STATE_LABELS[state]}
                </span>
              </div>
            ))}
          </div>

          {/* Device list */}
          <div style={{ marginTop: 26 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <LayoutGrid size={16} color="var(--text-muted)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Devices ({sorted.length})
              </span>
            </div>

            {sorted.length === 0 ? (
              <EmptyBlock label="No devices on this floor" small />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 12,
                }}
              >
                {sorted.map((device) => (
                  <div
                    key={device.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectDevice(device)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectDevice(device);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${STATE_COLORS[device.state]}1f`,
                        color: STATE_COLORS[device.state],
                        flexShrink: 0,
                      }}
                    >
                      <DeviceIcon type={device.type} size={18} />
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {device.label || 'Device'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {DEVICE_TYPE_LABELS[device.type]}
                      </div>
                    </div>
                    <StatusChip state={device.state} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Cluster({
  devices,
  onSelectDevice,
}: {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
}) {
  const shown = devices.slice(0, 3);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 46 }}>
      {shown.map((d) => (
        <DeviceBadge key={d.id} device={d} size={18} onClick={onSelectDevice} />
      ))}
      {devices.length > 3 && (
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--series-5)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          +{devices.length - 3}
        </span>
      )}
    </div>
  );
}

function EmptyBlock({ label, small }: { label: string; small?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: small ? 24 : 48,
        color: 'var(--text-muted)',
        fontSize: 14,
        border: '1px dashed var(--border)',
        borderRadius: 14,
        margin: small ? 0 : 22,
      }}
    >
      {label}
    </div>
  );
}
