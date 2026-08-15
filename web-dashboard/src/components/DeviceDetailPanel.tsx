import { useEffect, useState } from 'react';
import { X, Power, AlertTriangle, Clock, Timer, Video } from 'lucide-react';
import { DEVICE_TYPE_LABELS, type Device } from '../types';
import { DeviceIcon } from './DeviceIcon';
import { StatusChip } from './StatusChip';
import { STATE_COLORS, formatClock, formatDuration } from '../utils/helpers';
import {
  toggleDevice,
  toggleSwitch,
  setAllSwitches,
  updateSchedule,
  updateMaxOnDuration,
} from '../services/deviceService';

interface Props {
  device: Device;
  ownerUserId: string;
  onClose: () => void;
}

/** Slide-over panel with live controls for a single device. */
export function DeviceDetailPanel({ device, ownerUserId, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local draft for the schedule fields, re-synced when the device changes.
  const [start, setStart] = useState(device.scheduleStart);
  const [end, setEnd] = useState(device.scheduleEnd);
  const [maxMinutes, setMaxMinutes] = useState(Math.round(device.maxOnDurationSec / 60));

  useEffect(() => {
    setStart(device.scheduleStart);
    setEnd(device.scheduleEnd);
    setMaxMinutes(Math.round(device.maxOnDurationSec / 60));
  }, [device.id, device.scheduleStart, device.scheduleEnd, device.maxOnDurationSec]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /** Runs a write, surfacing permission/network failures instead of failing silently. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setBusy(false);
    }
  }

  const controllable = device.state === 'ON' || device.state === 'OFF';
  const switchCount = Math.max(device.switchCount ?? 1, device.switchStates?.length ?? 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)',
          height: '100%',
          overflowY: 'auto',
          background: 'var(--surface-1)',
          borderLeft: '1px solid var(--border)',
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${STATE_COLORS[device.state]}1f`,
              color: STATE_COLORS[device.state],
              flexShrink: 0,
            }}
          >
            <DeviceIcon type={device.type} size={21} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{device.label || 'Device'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {DEVICE_TYPE_LABELS[device.type]}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={iconBtn}>
            <X size={17} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusChip state={device.state} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Updated {formatClock(device.lastUpdated)}
          </span>
        </div>

        {error && (
          <div style={errorBox}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {!controllable && (
          <div style={noteBox}>
            This device is {device.state === 'ERROR' ? 'in an error state' : 'disconnected'} and
            cannot be switched until it recovers.
          </div>
        )}

        {/* Power toggle — every type except Camera and Multi-Switch */}
        {device.type !== 'CAMERA' && device.type !== 'MULTI_SWITCH' && (
          <button
            disabled={busy || !controllable}
            onClick={() => run(() => toggleDevice(device, ownerUserId))}
            style={{
              ...primaryBtn,
              background: device.state === 'ON' ? 'rgba(76,175,80,0.16)' : 'var(--surface-2)',
              borderColor: device.state === 'ON' ? STATE_COLORS.ON : 'var(--border)',
              color: device.state === 'ON' ? STATE_COLORS.ON : 'var(--text-secondary)',
              opacity: busy || !controllable ? 0.55 : 1,
              cursor: busy || !controllable ? 'not-allowed' : 'pointer',
            }}
          >
            <Power size={17} />
            Turn {device.state === 'ON' ? 'off' : 'on'}
          </button>
        )}

        {/* Multi-Switch */}
        {device.type === 'MULTI_SWITCH' && (
          <Section title={`Switches (${switchCount})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: switchCount }).map((_, i) => {
                const on = device.switchStates?.[i] ?? false;
                return (
                  <div key={i} style={rowBox}>
                    <span style={{ fontSize: 13.5, flex: 1, minWidth: 0 }}>
                      {device.switchNames?.[i] || `Switch ${i + 1}`}
                    </span>
                    <button
                      disabled={busy}
                      onClick={() => run(() => toggleSwitch(device, i, ownerUserId))}
                      style={{
                        ...pillBtn,
                        background: on ? 'rgba(76,175,80,0.16)' : 'var(--surface-3)',
                        borderColor: on ? STATE_COLORS.ON : 'var(--border)',
                        color: on ? STATE_COLORS.ON : 'var(--text-muted)',
                        cursor: busy ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {on ? 'On' : 'Off'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                disabled={busy}
                onClick={() => run(() => setAllSwitches(device, true))}
                style={{ ...secondaryBtn, flex: 1 }}
              >
                All on
              </button>
              <button
                disabled={busy}
                onClick={() => run(() => setAllSwitches(device, false))}
                style={{ ...secondaryBtn, flex: 1 }}
              >
                All off
              </button>
            </div>
          </Section>
        )}

        {/* Scheduled Light */}
        {device.type === 'SCHEDULED_LIGHT' && (
          <Section title="Schedule" icon={<Clock size={14} />}>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={fieldLabel}>
                From
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  style={input}
                />
              </label>
              <label style={fieldLabel}>
                To
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  style={input}
                />
              </label>
            </div>
            <div style={{ ...rowBox, marginTop: 10 }}>
              <span style={{ fontSize: 13.5, flex: 1 }}>Schedule enabled</span>
              <button
                disabled={busy}
                onClick={() =>
                  run(() =>
                    updateSchedule(device.id, {
                      scheduleStart: start,
                      scheduleEnd: end,
                      scheduleEnabled: !device.scheduleEnabled,
                    })
                  )
                }
                style={{
                  ...pillBtn,
                  background: device.scheduleEnabled ? 'rgba(76,175,80,0.16)' : 'var(--surface-3)',
                  borderColor: device.scheduleEnabled ? STATE_COLORS.ON : 'var(--border)',
                  color: device.scheduleEnabled ? STATE_COLORS.ON : 'var(--text-muted)',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                {device.scheduleEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <button
              disabled={busy || (start === device.scheduleStart && end === device.scheduleEnd)}
              onClick={() =>
                run(() =>
                  updateSchedule(device.id, {
                    scheduleStart: start,
                    scheduleEnd: end,
                    scheduleEnabled: device.scheduleEnabled,
                  })
                )
              }
              style={{
                ...secondaryBtn,
                width: '100%',
                marginTop: 10,
                opacity: start === device.scheduleStart && end === device.scheduleEnd ? 0.5 : 1,
              }}
            >
              Save schedule
            </button>
          </Section>
        )}

        {/* Safety-Timed */}
        {device.type === 'SAFETY_TIMED' && (
          <Section title="Auto shut-off" icon={<Timer size={14} />}>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>
              Turns off automatically after {formatDuration(device.maxOnDurationSec)}
              {device.state === 'ON' && device.turnedOnAt > 0 && (
                <> · on since {formatClock(device.turnedOnAt)}</>
              )}
              {device.autoOffTriggered && <> · last shut off automatically</>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <label style={{ ...fieldLabel, flex: 1 }}>
                Minutes
                <input
                  type="number"
                  min={1}
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(Number(e.target.value))}
                  style={input}
                />
              </label>
              <button
                disabled={busy || maxMinutes < 1 || maxMinutes * 60 === device.maxOnDurationSec}
                onClick={() => run(() => updateMaxOnDuration(device.id, maxMinutes * 60))}
                style={{
                  ...secondaryBtn,
                  opacity: maxMinutes * 60 === device.maxOnDurationSec ? 0.5 : 1,
                }}
              >
                Save
              </button>
            </div>
          </Section>
        )}

        {/* Camera */}
        {device.type === 'CAMERA' && (
          <Section title="Camera" icon={<Video size={14} />}>
            {device.snapshotUrl ? (
              <img
                src={device.snapshotUrl}
                alt={`${device.label} snapshot`}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)' }}
              />
            ) : (
              <div style={noteBox}>No snapshot URL set for this camera.</div>
            )}
            {device.streamUrl && (
              <a
                href={device.streamUrl}
                target="_blank"
                rel="noreferrer"
                style={{ ...secondaryBtn, display: 'flex', marginTop: 10, textDecoration: 'none' }}
              >
                Open live stream
              </a>
            )}
          </Section>
        )}

        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 'auto' }}>
          Changes are written straight to the Realtime Database and appear on the mobile app
          immediately.
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 10,
          color: 'var(--text-secondary)',
        }}
      >
        {icon}
        <span style={{ fontSize: 13, fontWeight: 700 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Shared inline styles (consistent with the rest of the dashboard) ──
const iconBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const primaryBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  padding: '13px 16px',
  borderRadius: 13,
  border: '1px solid',
  fontSize: 14,
  fontWeight: 700,
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 11,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  textAlign: 'center',
};

const pillBtn: React.CSSProperties = {
  minWidth: 58,
  padding: '6px 13px',
  borderRadius: 999,
  border: '1px solid',
  fontSize: 12.5,
  fontWeight: 700,
};

const rowBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 13px',
  borderRadius: 12,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
};

const fieldLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: 'var(--text-muted)',
  flex: 1,
};

const input: React.CSSProperties = {
  padding: '9px 11px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text-primary)',
  fontSize: 13.5,
  width: '100%',
};

const errorBox: React.CSSProperties = {
  display: 'flex',
  gap: 9,
  padding: '11px 13px',
  borderRadius: 12,
  background: 'rgba(255,82,82,0.12)',
  border: '1px solid rgba(255,82,82,0.5)',
  color: '#ff8a80',
  fontSize: 12.5,
  lineHeight: 1.45,
};

const noteBox: React.CSSProperties = {
  padding: '11px 13px',
  borderRadius: 12,
  background: 'var(--surface-2)',
  border: '1px dashed var(--border)',
  color: 'var(--text-muted)',
  fontSize: 12.5,
  lineHeight: 1.45,
};
