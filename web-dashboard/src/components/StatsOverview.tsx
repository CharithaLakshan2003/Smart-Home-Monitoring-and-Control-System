import { Cpu, Power, TriangleAlert, Layers } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Device, Floor, Alert } from '../types';
import { isAlertState } from '../utils/helpers';

interface Props {
  devices: Device[];
  floors: Floor[];
  alerts: Alert[];
  onOpenAlerts?: () => void;
}

interface Tile {
  label: string;
  value: number;
  sub: string;
  icon: ReactNode;
  accent: string;
  onClick?: () => void;
}

export function StatsOverview({ devices, floors, alerts, onOpenAlerts }: Props) {
  const onCount = devices.filter((d) => d.state === 'ON').length;
  const alertDevices = devices.filter((d) => isAlertState(d.state)).length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const tiles: Tile[] = [
    {
      label: 'Total Devices',
      value: devices.length,
      sub: `across ${floors.length} floor${floors.length === 1 ? '' : 's'}`,
      icon: <Cpu size={20} />,
      accent: 'var(--series-1)',
    },
    {
      label: 'Devices On',
      value: onCount,
      sub: devices.length ? `${Math.round((onCount / devices.length) * 100)}% active` : 'none active',
      icon: <Power size={20} />,
      accent: 'var(--good)',
    },
    {
      label: 'Devices in Alert',
      value: alertDevices,
      sub: 'error / disconnected',
      icon: <TriangleAlert size={20} />,
      accent: alertDevices > 0 ? 'var(--critical)' : 'var(--text-muted)',
      onClick: onOpenAlerts,
    },
    {
      label: 'Unread Alerts',
      value: unreadAlerts,
      sub: `${alerts.length} total logged`,
      icon: <Layers size={20} />,
      accent: unreadAlerts > 0 ? 'var(--warning)' : 'var(--text-muted)',
      onClick: onOpenAlerts,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 18,
      }}
    >
      {tiles.map((t) => (
        <div
          key={t.label}
          onClick={t.onClick}
          role={t.onClick ? 'button' : undefined}
          tabIndex={t.onClick ? 0 : undefined}
          onKeyDown={
            t.onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    t.onClick?.();
                  }
                }
              : undefined
          }
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            animation: 'fade-in 0.4s ease',
            cursor: t.onClick ? 'pointer' : 'default',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t.label}
            </span>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-3)',
                color: t.accent,
              }}
            >
              {t.icon}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: t.accent }}>
              {t.value}
            </span>
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{t.sub}</span>
        </div>
      ))}
    </div>
  );
}
