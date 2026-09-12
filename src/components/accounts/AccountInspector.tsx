import React from 'react';
import { SmashConnection } from '../../contexts/AccountsContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { CheckCircle2, ShieldAlert, Cpu, Activity, Clock, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AccountInspector: React.FC<{ connection: SmashConnection }> = ({ connection }) => {
  return (
    <div className="flex flex-col gap-6 w-full text-white pb-10">
      
      {/* Header Info */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl glass-3 flex items-center justify-center font-black text-lg text-[#D946EF] border border-[#D946EF]/30">
            {connection.provider.slice(0, 2)}
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="font-black text-lg tracking-tight leading-none mb-1">{connection.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-smash-text-secondary">{connection.provider}</span>
              <Badge variant="connection" className="text-[8px]">{connection.type}</Badge>
            </div>
          </div>
        </div>
        
        <div className="glass-3 rounded-xl p-3 flex justify-between items-center border border-white/5 mt-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Current Status</span>
          <StatusIndicator state={connection.status as any} />
        </div>
      </div>

      {/* Capabilities */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Capabilities</h4>
          <span className="text-[9px] text-[#7C3AED] font-bold">AUTO-DETECTED</span>
        </div>
        <div className="glass-2 rounded-xl border border-white/5 p-1 flex flex-col gap-1">
          {['IMAGE', 'VIDEO', 'TEXT', 'AUDIO'].map(cap => {
            const hasCap = connection.capabilities.includes(cap as any);
            return (
              <div key={cap} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Badge variant={hasCap ? cap.toLowerCase() as any : 'outline'} className={cn(!hasCap && "opacity-30")}>{cap}</Badge>
                  <span className={cn("text-xs font-bold", !hasCap && "text-smash-text-tertiary")}>
                    {cap.charAt(0) + cap.slice(1).toLowerCase()} Generation
                  </span>
                </div>
                <div className={cn("w-8 h-4 rounded-full flex items-center p-0.5 transition-colors", hasCap ? "bg-violet-500" : "bg-white/10")}>
                  <div className={cn("w-3 h-3 rounded-full bg-white transition-transform", hasCap ? "translate-x-4" : "translate-x-0")} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Specific Config */}
      {connection.type === 'BROWSER' && (
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Session Isolation</h4>
          <div className="glass-2 rounded-xl border border-white/5 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-smash-text-tertiary uppercase">Profile ID</span>
              <span className="text-sm font-mono text-white bg-white/5 px-2 py-1 rounded-md inline-block self-start">mock-profile-id</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-smash-text-tertiary uppercase">Login Email</span>
              <span className="text-sm font-bold text-white">mock@example.com</span>
            </div>
            <Button variant="primary" className="w-full mt-2 h-10"><Globe size={14} /> Open Secure Session</Button>
          </div>
        </div>
      )}

      {connection.type === 'API' && (
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Authentication</h4>
          <div className="glass-2 rounded-xl border border-white/5 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-smash-text-tertiary uppercase">API Key</span>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-sm font-mono text-white tracking-widest">••••••••••••AB29</span>
                <Button variant="ghost" size="sm" className="h-6 text-[9px]">REPLACE</Button>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <ShieldAlert size={16} className="text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-smash-text-secondary leading-relaxed">
                Credentials are encrypted and stored in secure vault. Only masked values are accessible to the client.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health & Routing */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Health & Routing</h4>
        <div className="glass-2 rounded-xl border border-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-smash-text-tertiary" />
              <span className="text-xs font-bold text-smash-text-secondary">Last Checked</span>
            </div>
            <span className="text-xs font-mono text-white">2 mins ago</span>
          </div>
          
          <div className="h-px w-full bg-white/5" />
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Auto-Reconnect</span>
              <span className="text-[9px] text-smash-text-tertiary">Retry if endpoint drops</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-[#D946EF] flex items-center p-0.5 transition-colors">
              <div className="w-3 h-3 rounded-full bg-white translate-x-4" />
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-smash-text-tertiary uppercase">Fallback Connection</span>
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white flex justify-between items-center cursor-pointer hover:bg-white/10">
              {connection.fallbackId ? 'Gemini Web #3' : 'None Selected'}
              <span className="text-[10px] text-[#D946EF]">CHANGE</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
