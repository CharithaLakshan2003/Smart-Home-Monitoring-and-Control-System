import { useMemo, useState, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { BarChart3, Clock, Activity, Gauge } from 'lucide-react';
import { DATE_RANGE_LABELS, type DateRange, type UsageLog } from '../types';
import { formatDuration } from '../utils/helpers';

interface Props {
  logs: UsageLog[];
  theme: 'dark' | 'light';
}

// Concrete hex per theme so SVG fills resolve. Accent = the app's primary teal.
const PALETTE = {
  dark: { accent: '#00bcd4', axis: '#8f8b99', grid: '#2a2a3a' },
  light: { accent: '#00838f', axis: '#6b6772', grid: '#d9d9e3' },
};

const RANGE_MS: Record<DateRange, number> = {
  TODAY: 24 * 60 * 60 * 1000,
  THIS_WEEK: 7 * 24 * 60 * 60 * 1000,
  THIS_MONTH: 30 * 24 * 60 * 60 * 1000,
};

export function UsageCharts({ logs, theme }: Props) {
  const [range, setRange] = useState<DateRange>('THIS_WEEK');
  const { accent: BLUE, axis: AXIS, grid: GRID } = PALETTE[theme];

  const filtered = useMemo(() => {
    const cutoff = Date.now() - RANGE_MS[range];
    return logs.filter((l) => l.onTime >= cutoff);
  }, [logs, range]);

  // ── Per-device totals (top 10) ──
  const perDevice = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of filtered) {
      const name = l.deviceName || 'Unknown';
      map.set(name, (map.get(name) ?? 0) + l.durationSeconds);
    }
    return Array.from(map.entries())
      .map(([name, seconds]) => ({ name, seconds }))
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10);
  }, [filtered]);

  // ── Over-time series ──
  const timeSeries = useMemo(() => {
    const byHour = range === 'TODAY';
    const buckets = new Map<string, number>();
    const now = new Date();

    // seed empty buckets so the axis is continuous
    if (byHour) {
      for (let h = 0; h < 24; h++) buckets.set(`${String(h).padStart(2, '0')}:00`, 0);
    } else {
      const days = range === 'THIS_WEEK' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        buckets.set(bucketKey(d), 0);
      }
    }

    for (const l of filtered) {
      const d = new Date(l.onTime);
      const key = byHour ? `${String(d.getHours()).padStart(2, '0')}:00` : bucketKey(d);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + l.durationSeconds);
    }
    return Array.from(buckets.entries()).map(([label, seconds]) => ({
      label,
      minutes: Math.round((seconds / 60) * 10) / 10,
    }));
  }, [filtered, range]);

  const totalSeconds = filtered.reduce((s, l) => s + l.durationSeconds, 0);
  const avgSeconds = filtered.length ? Math.round(totalSeconds / filtered.length) : 0;

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
        <BarChart3 size={18} color="var(--text-secondary)" />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Device Usage</h2>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--series-1)' : 'var(--border)'}`,
                  background: active ? 'rgba(0,188,212,0.14)' : 'var(--surface-2)',
                  color: active ? 'var(--series-1)' : 'var(--text-secondary)',
                }}
              >
                {DATE_RANGE_LABELS[r]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 22 }}>
        {/* Summary tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <MiniStat icon={<Clock size={16} />} label="Total On-Time" value={formatDuration(totalSeconds)} />
          <MiniStat icon={<Activity size={16} />} label="Usage Events" value={String(filtered.length)} />
          <MiniStat icon={<Gauge size={16} />} label="Avg Session" value={formatDuration(avgSeconds)} />
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
              color: 'var(--text-muted)',
              fontSize: 14,
              border: '1px dashed var(--border)',
              borderRadius: 14,
            }}
          >
            No usage recorded for {DATE_RANGE_LABELS[range].toLowerCase()}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {/* On-time by device */}
            <div>
              <ChartTitle>On-time by device</ChartTitle>
              <ResponsiveContainer width="100%" height={Math.max(180, perDevice.length * 38)}>
                <BarChart
                  data={perDevice}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke={GRID} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatDuration(v)}
                    stroke={AXIS}
                    tick={{ fill: AXIS, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    stroke={AXIS}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={<UsageTooltip unit="on-time" />}
                  />
                  <Bar dataKey="seconds" radius={[0, 4, 4, 0]} barSize={18}>
                    {perDevice.map((d) => (
                      <Cell key={d.name} fill={BLUE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Over time */}
            <div>
              <ChartTitle>
                On-time over {range === 'TODAY' ? 'the day (by hour)' : 'time (by day)'}
              </ChartTitle>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timeSeries} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
                  <defs>
                    <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BLUE} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="label"
                    stroke={AXIS}
                    tick={{ fill: AXIS, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    stroke={AXIS}
                    tick={{ fill: AXIS, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}m`}
                    width={44}
                  />
                  <Tooltip
                    cursor={{ stroke: BLUE, strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<UsageTooltip unit="minutes" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke={BLUE}
                    strokeWidth={2}
                    fill="url(#usageFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: BLUE, stroke: 'var(--surface-1)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function bucketKey(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChartTitle({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          color: 'var(--text-muted)',
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Record<string, unknown>; value: number }>;
  label?: string;
  unit: 'on-time' | 'minutes';
}

function UsageTooltip({ active, payload, label, unit }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0];
  const name = (point.payload.name as string) ?? label ?? '';
  const text =
    unit === 'on-time' ? formatDuration(point.value) : `${point.value} min on-time`;
  return (
    <div
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border-strong)',
        borderRadius: 10,
        padding: '9px 12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 12.5, color: 'var(--series-1)', fontWeight: 700 }}>{text}</div>
    </div>
  );
}
