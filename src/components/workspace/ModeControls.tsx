import React from 'react';
import { Capability } from '../../types/accounts';
import { AspectRatio, GenerationOptions } from '../../types/api';
import { Sliders } from 'lucide-react';

const selectClass = 'bg-transparent text-sm font-bold text-white border-none outline-none w-full [&>option]:bg-black';

const Tile: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className, children }) => (
  <div className={`glass-3 rounded-xl p-3 flex flex-col gap-2 ${className ?? ''}`}>
    <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">{label}</span>
    {children}
  </div>
);

const ASPECT_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1 Square' },
  { value: '4:5', label: '4:5 Portrait (Feed)' },
  { value: '9:16', label: '9:16 Story / Reel' },
  { value: '16:9', label: '16:9 Widescreen' },
  { value: '3:4', label: '3:4 Portrait' },
  { value: '4:3', label: '4:3 Landscape' },
];

interface ModeControlsProps {
  mode: Capability;
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
}

/**
 * Generation settings. IMAGE options are controlled and sent with the session;
 * the other modes' options have no server-side effect yet and stay local.
 */
export const ModeControls: React.FC<ModeControlsProps> = ({ mode, options, onChange }) => {
  const set = (patch: Partial<GenerationOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="glass-2 rounded-[24px] p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
          <Sliders size={16} className="text-[#D946EF]" /> {mode.charAt(0) + mode.slice(1).toLowerCase()} Settings
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mode === 'IMAGE' && (
          <>
            <Tile label="Aspect Ratio">
              <select
                className={selectClass}
                value={options.aspectRatio ?? '1:1'}
                onChange={(e) => set({ aspectRatio: e.target.value as AspectRatio })}
              >
                {ASPECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Tile>
            <Tile label="Resolution">
              <select
                className={selectClass}
                value={options.resolution ?? 'standard'}
                onChange={(e) => set({ resolution: e.target.value })}
              >
                <option value="standard">Standard</option>
                <option value="high">High detail</option>
              </select>
            </Tile>
            <Tile label="Outputs per Model">
              <select
                className={selectClass}
                value={options.outputsPerModel ?? 1}
                onChange={(e) => set({ outputsPerModel: Number(e.target.value) })}
              >
                <option value={1}>1 Output</option>
                <option value={2}>2 Outputs</option>
                <option value={3}>3 Outputs</option>
                <option value={4}>4 Outputs</option>
              </select>
            </Tile>
          </>
        )}

        {mode === 'VIDEO' && (
          <>
            <Tile label="Aspect Ratio">
              <select className={selectClass}>
                <option>16:9 Landscape</option>
                <option>9:16 Vertical</option>
                <option>1:1 Square</option>
              </select>
            </Tile>
            <Tile label="Duration">
              <select className={selectClass}>
                <option>5 Seconds</option>
                <option>10 Seconds</option>
              </select>
            </Tile>
          </>
        )}

        {mode === 'TEXT' && (
          <Tile label="Format">
            <select className={selectClass}>
              <option>Markdown</option>
              <option>Plain Text</option>
            </select>
          </Tile>
        )}

        {mode === 'AUDIO' && (
          <Tile label="Language">
            <select className={selectClass}>
              <option>English (US)</option>
              <option>Bengali (BD)</option>
            </select>
          </Tile>
        )}
      </div>
    </div>
  );
};
