import { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Device } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { toggleSafetyDevice } from '../../actions/deviceActions';
import { formatDuration } from '../../utils/helpers';

interface SafetyTimedCardProps {
  device: Device;
  isOn: boolean;
  isDisabled: boolean;
}

export function SafetyTimedCard({ device, isOn, isDisabled }: SafetyTimedCardProps) {
  const maxDuration = device.maxOnDurationSec || 1800;
  const turnedOnAt = device.turnedOnAt || 0;
  const autoOffTriggered = device.autoOffTriggered || false;

  const [remaining, setRemaining] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOn && turnedOnAt > 0) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - turnedOnAt) / 1000);
        const rem = Math.max(0, maxDuration - elapsed);
        const pct = Math.min(100, (elapsed / maxDuration) * 100);
        setRemaining(rem);
        setPercentage(pct);
      };

      tick(); // Immediate
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setRemaining(0);
      setPercentage(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOn, turnedOnAt, maxDuration]);

  const isCritical = remaining < 60 && remaining > 0;

  return (
    <>
      {/* Power toggle */}
      <div className="flex items-center gap-3 mt-3.5">
        <span className="text-[0.8rem] text-[var(--text-secondary)] font-medium">Power</span>
        <ToggleSwitch
          checked={isOn}
          disabled={isDisabled}
          onChange={(checked) => toggleSafetyDevice(device.id, checked)}
        />
      </div>

      {/* Timer section */}
      <div
        className="mt-3.5 p-3 rounded-lg"
        style={{
          background: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.15)',
        }}
      >
        {isOn && turnedOnAt > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
                Time Remaining
              </span>
              <span
                className={`font-mono text-lg font-semibold ${isCritical ? 'text-[var(--color-state-error)] animate-[pulse-text_1s_infinite]' : 'text-[#f97316]'}`}
              >
                {formatDuration(remaining)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
              <div
                className="h-full rounded-sm transition-[width] duration-1000 linear"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #f97316, #ef4444)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
                Max Duration
              </span>
              <span className="text-[0.78rem] text-[var(--text-secondary)] font-mono">
                {formatDuration(maxDuration)}
              </span>
            </div>
          </>
        ) : autoOffTriggered ? (
          <>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[0.72rem] font-semibold"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
            >
              <AlertTriangle size={12} /> Auto-off was triggered (safety cutoff)
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
                Max Duration
              </span>
              <span className="text-[0.78rem] text-[var(--text-secondary)] font-mono">
                {formatDuration(maxDuration)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
              Max Duration
            </span>
            <span className="text-[0.78rem] text-[var(--text-secondary)] font-mono">
              {formatDuration(maxDuration)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
