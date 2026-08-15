import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Sun, Moon, Bell } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface Props {
  isConnected: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  unreadCount: number;
  alertsActive: boolean;
  onOpenAlerts: () => void;
}

export function Header({
  isConnected,
  theme,
  onToggleTheme,
  unreadCount,
  alertsActive,
  onOpenAlerts,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const badge = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '18px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <AppLogo size={42} />
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>Smart Home</div>
          <div style={{ fontSize: 12, color: 'var(--series-1)', fontWeight: 600 }}>
            Monitor &amp; Control
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontSize: 15,
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
          className="header-clock"
        >
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: isConnected ? 'rgba(76,175,80,0.14)' : 'rgba(255,82,82,0.14)',
          }}
        >
          {isConnected ? (
            <Wifi size={15} color="var(--good)" />
          ) : (
            <WifiOff size={15} color="var(--critical)" />
          )}
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: isConnected ? 'var(--good)' : 'var(--critical)',
            }}
            className="header-conn-label"
          >
            {isConnected ? 'Connected' : 'Offline'}
          </span>
          {isConnected && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: 'var(--good)',
                animation: 'pulse-dot 1.6s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Notification bell */}
        <button
          onClick={onOpenAlerts}
          title="Alerts"
          aria-label={`Alerts${unreadCount ? `, ${unreadCount} unread` : ''}`}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: `1px solid ${alertsActive ? 'var(--series-1)' : 'var(--border)'}`,
            background: alertsActive ? 'rgba(0,188,212,0.14)' : 'var(--surface-2)',
            color: alertsActive ? 'var(--series-1)' : 'var(--text-secondary)',
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                minWidth: 18,
                height: 18,
                padding: '0 5px',
                borderRadius: 999,
                background: 'var(--critical)',
                color: '#fff',
                fontSize: 10.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--surface-1)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {badge}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text-secondary)',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .header-clock { display: none; }
          .header-conn-label { display: none; }
        }
      `}</style>
    </header>
  );
}
