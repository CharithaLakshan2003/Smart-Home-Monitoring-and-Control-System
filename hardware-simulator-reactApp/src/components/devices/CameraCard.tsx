import { Video, VideoOff } from 'lucide-react';
import type { Device } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { toggleDevice } from '../../actions/deviceActions';

interface CameraCardProps {
  device: Device;
  isOn: boolean;
  isDisabled: boolean;
}

export function CameraCard({ device, isOn, isDisabled }: CameraCardProps) {
  const snapshotUrl = device.snapshotUrl || '';
  const streamUrl = device.streamUrl || '';

  return (
    <>
      {/* Camera feed toggle */}
      <div className="flex items-center gap-5 mt-8">
        <span className="text-[1rem] text-[var(--text-secondary)] font-medium w-32">Camera Feed</span>
        <ToggleSwitch
          checked={isOn}
          disabled={isDisabled}
          onChange={(checked) => toggleDevice(device.id, checked)}
        />
      </div>

      {/* Camera preview */}
      <div className="mt-6">
        <div
          className={`w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-3 overflow-hidden relative ${
            isOn ? 'border-[rgba(20,184,166,0.3)]' : ''
          }`}
          style={{
            background: 'rgba(20, 184, 166, 0.05)',
            border: `1px solid ${isOn ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.15)'}`,
          }}
        >
          {snapshotUrl ? (
            <img
              src={snapshotUrl}
              alt="Camera snapshot"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <>
              <span className="text-[2rem] opacity-50">
                {isOn ? <Video className="text-[#14b8a6]" size={32} /> : <VideoOff className="text-[#14b8a6]" size={32} />}
              </span>
              <span className="text-[0.75rem] text-[var(--text-muted)] font-medium">
                {isOn ? 'Live Feed Active' : 'Camera Off'}
              </span>
            </>
          )}

          {/* REC indicator */}
          {isOn && (
            <span className="absolute top-2 right-2 text-[0.65rem] font-bold text-[var(--color-state-error)] animate-[pulse-text_1.5s_infinite] tracking-wide">
              ● REC
            </span>
          )}
        </div>

        {streamUrl && (
          <div className="mt-3 font-mono text-[0.8rem] text-[var(--text-dim)] break-all px-4 py-3 rounded-lg bg-white/[0.03]">
            Stream: {streamUrl}
          </div>
        )}
        {snapshotUrl && (
          <div className="mt-3 font-mono text-[0.8rem] text-[var(--text-dim)] break-all px-4 py-3 rounded-lg bg-white/[0.03]">
            Snapshot: {snapshotUrl}
          </div>
        )}
      </div>
    </>
  );
}
