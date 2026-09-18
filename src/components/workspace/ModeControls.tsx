import React from 'react';
import { Capability } from '../../types/accounts';
import { AspectRatio, GenerationOptions } from '../../types/api';
import { Sliders } from 'lucide-react';
import { SelectField } from '../ui/select-field';

const selectClass = 'h-8 px-0 border-0 bg-transparent shadow-none text-sm font-semibold text-white hover:border-0 focus-visible:ring-0 data-[state=open]:border-0';

const Tile: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className, children }) => (
  <div className={`rounded-xl p-3 flex flex-col gap-1 border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 focus-within:border-[#D946EF]/50 ${className ?? ''}`}>
    <span className="text-[10px] font-bold uppercase text-smash-text-secondary tracking-widest">{label}</span>
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
    <div className="glass-2 rounded-2xl p-5 md:p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders size={16} className="text-[#D946EF]" /> {mode.charAt(0) + mode.slice(1).toLowerCase()} Settings
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mode === 'IMAGE' && (
          <>
            <Tile label="Aspect Ratio">
              <SelectField
                className={selectClass}
                aria-label="Aspect Ratio"
                value={options.aspectRatio ?? '1:1'}
                onValueChange={(v) => set({ aspectRatio: v as AspectRatio })}
                options={ASPECT_OPTIONS}
              />
            </Tile>
            <Tile label="Resolution">
              <SelectField
                className={selectClass}
                aria-label="Resolution"
                value={options.resolution ?? 'standard'}
                onValueChange={(v) => set({ resolution: v })}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'high', label: 'High detail' },
                ]}
              />
            </Tile>
            <Tile label="Outputs per Model">
              <SelectField
                className={selectClass}
                aria-label="Outputs per Model"
                value={options.outputsPerModel ?? 1}
                onValueChange={(v) => set({ outputsPerModel: Number(v) })}
                options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n} Output${n > 1 ? 's' : ''}` }))}
              />
            </Tile>
          </>
        )}

        {mode === 'VIDEO' && (
          <>
            <Tile label="Aspect Ratio">
              <SelectField className={selectClass} defaultValue="16:9 Landscape" options={['16:9 Landscape', '9:16 Vertical', '1:1 Square'].map((o) => ({ value: o, label: o }))} />
            </Tile>
            <Tile label="Duration">
              <SelectField className={selectClass} defaultValue="5 Seconds" options={['5 Seconds', '10 Seconds'].map((o) => ({ value: o, label: o }))} />
            </Tile>
          </>
        )}

        {mode === 'TEXT' && (
          <Tile label="Format">
            <SelectField className={selectClass} defaultValue="Markdown" options={['Markdown', 'Plain Text'].map((o) => ({ value: o, label: o }))} />
          </Tile>
        )}

        {mode === 'AUDIO' && (
          <Tile label="Language">
            <SelectField className={selectClass} defaultValue="English (US)" options={['English (US)', 'Bengali (BD)'].map((o) => ({ value: o, label: o }))} />
          </Tile>
        )}
      </div>
    </div>
  );
};
