import React from 'react';
import { Capability } from '../../types/accounts';
import { Sliders, MonitorPlay, Maximize, Settings2 } from 'lucide-react';

export const ModeControls: React.FC<{ mode: Capability }> = ({ mode }) => {
  return (
    <div className="glass-2 rounded-[24px] p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
          <Sliders size={16} className="text-[#D946EF]"/> {mode.charAt(0) + mode.slice(1).toLowerCase()} Settings
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-smash-text-tertiary cursor-pointer hover:text-white flex items-center gap-1">
          <Settings2 size={12} /> Advanced Drawer
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mode === 'IMAGE' && (
          <>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Aspect Ratio</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>16:9 Widescreen</option>
                <option>1:1 Square</option>
                <option>4:5 Portrait</option>
                <option>9:16 Vertical</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Resolution</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>1080p (Standard)</option>
                <option>4K (Upscaled)</option>
                <option>Fast (720p)</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Generation Mode</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>Text to Image</option>
                <option>Image to Image</option>
                <option>Inpainting / Edit</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Outputs per Model</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>1 Output</option>
                <option>2 Outputs</option>
                <option>4 Outputs</option>
              </select>
            </div>
          </>
        )}

        {mode === 'VIDEO' && (
          <>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Aspect Ratio</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>16:9 Landscape</option>
                <option>9:16 Vertical</option>
                <option>1:1 Square</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Duration</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>5 Seconds</option>
                <option>10 Seconds</option>
                <option>15 Seconds</option>
                <option>Looping (Auto)</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Motion & Camera</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>Auto (Let AI Decide)</option>
                <option>Slow Pan / Cinematic</option>
                <option>Zoom In / Macro</option>
                <option>Dynamic Action</option>
              </select>
            </div>
          </>
        )}

        {mode === 'TEXT' && (
          <>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Operation Mode</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>Normal / Chat</option>
                <option>Deep Research</option>
                <option>Data Analysis</option>
                <option>Code Generation</option>
                <option>Creative Writing</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Format</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>Markdown</option>
                <option>JSON Structured</option>
                <option>Plain Text</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2 md:col-span-2">
               <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">System Instructions (Context)</span>
               <input type="text" placeholder="e.g. You are a senior React developer..." className="bg-transparent border-none outline-none text-sm font-medium placeholder:opacity-30 w-full" />
            </div>
          </>
        )}
        
        {mode === 'AUDIO' && (
          <>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Audio Type</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>TTS (Text to Speech)</option>
                <option>Music Generation</option>
                <option>Sound Effects</option>
                <option>STT (Transcription)</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Language</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none">
                <option>English (US)</option>
                <option>Bengali (BD)</option>
                <option>Multilingual Auto</option>
              </select>
            </div>
            <div className="glass-3 rounded-xl p-3 flex flex-col gap-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase text-smash-text-secondary tracking-widest">Voice Profile / Emotion</span>
              <select className="bg-transparent text-sm font-bold text-white border-none outline-none w-full">
                <option>Professional / Neutral</option>
                <option>Warm / Friendly</option>
                <option>Energetic / Promo</option>
                <option>Calm / Narrative</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
