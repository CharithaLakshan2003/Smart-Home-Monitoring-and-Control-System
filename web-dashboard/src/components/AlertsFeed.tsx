import { ArrowLeft, Bell, TriangleAlert, Power, Timer } from 'lucide-react';
import type { Alert } from '../types';
import { formatRelativeTime } from '../utils/helpers';

interface Props {
  alerts: Alert[];
  onBack: () => void;
}

function iconFor(message: string) {
  const m = message.toLowerCase();
  if (m.includes('auto') || m.includes('shut-off') || m.includes('safety')) {
    return { icon: <Timer size={17} />, color: 'var(--critical)' };
  }
  if (m.includes('error') || m.includes('disconnect')) {
    return { icon: <TriangleAlert size={17} />, color: 'var(--warning)' };
  }
  if (m.includes('on')) {
    return { icon: <Power size={17} />, color: 'var(--good)' };
  }
  return { icon: <Power size={17} />, color: 'var(--text-muted)' };
}

function dayLabel(ts: number): string {
  if (!ts) return 'Earlier';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function clockTime(ts: number): string {
  if (!ts) return '--:--';
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Full-page Alerts view (opened from the header bell). */
export function AlertsPage({ alerts, onBack }: Props) {
  const unread = alerts.filter((a) => !a.read).length;

  // Group alerts (already sorted newest-first) by day label, preserving order.
  const groups: Array<{ label: string; items: Alert[] }> = [];
  for (const a of alerts) {
    const label = dayLabel(a.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }

  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        maxWidth: 860,
        margin: '0 auto',
        padding: '26px clamp(16px, 3vw, 34px) 60px',
      }}
    >
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          onClick={onBack}
          aria-label="Back to dashboard"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-3)',
            color: 'var(--series-1)',
          }}
        >
          <Bell size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Alerts</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
            {alerts.length} total{unread > 0 ? ` · ${unread} unread` : ''}
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '80px 20px',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border)',
            borderRadius: 18,
            background: 'var(--surface-1)',
          }}
        >
          <Bell size={36} />
          <span style={{ fontSize: 15 }}>No alerts yet</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {groups.map((group) => (
            <div key={group.label}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 12,
                  paddingLeft: 4,
                }}
              >
                {group.label}
              </div>
              <div
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 18,
                  overflow: 'hidden',
                }}
              >
                {group.items.map((alert, i) => {
                  const { icon, color } = iconFor(alert.message);
                  return (
                    <div
                      key={alert.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '16px 18px',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                        background: alert.read ? 'transparent' : 'rgba(0,188,212,0.06)',
                      }}
                    >
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--surface-3)',
                          color,
                        }}
                      >
                        {icon}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: 15, fontWeight: 700 }}>
                            {alert.deviceName || 'Device'}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--text-muted)',
                              flexShrink: 0,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {clockTime(alert.timestamp)} · {formatRelativeTime(alert.timestamp)}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>
                          {alert.message}
                        </div>
                      </div>
                      {!alert.read && (
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 999,
                            background: 'var(--series-1)',
                            flexShrink: 0,
                            marginTop: 6,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
