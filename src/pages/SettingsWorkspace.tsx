import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Settings, Users, Shield, Bell, HardDrive, Cpu, SlidersHorizontal, Lock, Search, AlertCircle, Trash2, Key } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SECTIONS = [
  { id: 'GENERAL', icon: <Settings size={14} />, label: 'General & Appearance' },
  { id: 'GENERATION', icon: <SlidersHorizontal size={14} />, label: 'Generation & Defaults' },
  { id: 'NOTIFICATIONS', icon: <Bell size={14} />, label: 'Notifications' },
  { id: 'STORAGE', icon: <HardDrive size={14} />, label: 'Storage & Retention' },
  { id: 'SECURITY', icon: <Lock size={14} />, label: 'Security & Secrets' },
  { id: 'TEAM', icon: <Users size={14} />, label: 'Team & Permissions (Admin)' },
  { id: 'SYSTEM', icon: <Activity size={14} />, label: 'System Health (Admin)' },
];

import { Activity } from 'lucide-react'; // Fix import

const Toggle = ({ label, desc, active }: { label: string, desc?: string, active: boolean }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-bold text-white">{label}</span>
      {desc && <span className="text-[10px] text-smash-text-secondary">{desc}</span>}
    </div>
    <div className={cn("w-10 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer", active ? "bg-[#D946EF]" : "bg-white/10")}>
      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", active ? "translate-x-4" : "translate-x-0")} />
    </div>
  </div>
);

export const SettingsWorkspace: React.FC = () => {
  const [activeSection, setActiveSection] = useState('GENERAL');

  return (
    <PageContainer
      title="Platform Settings"
      description="Configure SMASH behavior, security, limits, and team access."
    >
      <div className="flex flex-col md:flex-row h-full gap-6 pb-20">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                activeSection === sec.id 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" 
                  : "text-smash-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn("shrink-0", activeSection === sec.id && "text-[#D946EF]")}>{sec.icon}</div>
              {sec.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-1 border border-white/5 rounded-3xl p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {activeSection === 'GENERAL' && (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 max-w-2xl">
                <div>
                  <h2 className="text-lg font-black text-white mb-1">Appearance</h2>
                  <p className="text-sm text-smash-text-secondary mb-6">Manage visual density and motion preferences.</p>
                  
                  <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col divide-y divide-white/5">
                    <Toggle label="Dark Mode" desc="SMASH is designed dark-first." active={true} />
                    <Toggle label="Reduced Motion" desc="Remove non-essential animations." active={false} />
                    <Toggle label="Compact Density" desc="Fit more operational data on screen." active={false} />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-white mb-1">Defaults</h2>
                  <p className="text-sm text-smash-text-secondary mb-6">Set standard behaviors for new sessions.</p>
                  
                  <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-smash-text-secondary uppercase">Startup Mode</label>
                      <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none w-full">
                        <option>Text Generation</option>
                        <option>Image Generation</option>
                        <option>Dashboard</option>
                        <option>Last Used</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'NOTIFICATIONS' && (
              <motion.div key="notif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 max-w-2xl">
                <div>
                  <h2 className="text-lg font-black text-white mb-1">Notification Preferences</h2>
                  <p className="text-sm text-smash-text-secondary mb-6">Control what triggers in-app alerts.</p>
                  
                  <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col divide-y divide-white/5">
                    <Toggle label="Task Completed" desc="Notify when a multi-model batch finishes." active={true} />
                    <Toggle label="Limit Reached" desc="Crucial operational warnings." active={true} />
                    <Toggle label="Account Active Again" desc="Notify when a quota resets." active={true} />
                    <Toggle label="Budget Threshold" desc="Warn when API spend exceeds limits." active={true} />
                    <Toggle label="Session Expired" desc="Notify when browser auth is lost." active={true} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'GENERATION' && (
              <motion.div key="gen-set" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 max-w-2xl">
                 <div>
                  <h2 className="text-lg font-black text-white mb-1">Retry & Limit Logic</h2>
                  <p className="text-sm text-smash-text-secondary mb-6">Configure how SMASH handles API errors and safety filters.</p>
                  
                  <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col divide-y divide-white/5">
                    <Toggle label="Technical Auto-Retry" desc="Retry on 500/502/timeout errors." active={true} />
                    <div className="py-4 flex flex-col gap-2">
                      <span className="text-sm font-bold text-white">Violation Retry Logic</span>
                      <span className="text-[10px] text-smash-text-secondary">If a model refuses a prompt due to safety limits, automatically inject the correction command.</span>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-[10px] text-[#D946EF] mt-2">
                        "যে part-টা violation আসছে ওইটা বাদ দিয়ে generate করো।"
                      </div>
                      <Toggle label="Enable Violation Auto-Retry" active={true} />
                    </div>
                    <Toggle label="Auto-Resume on Limit Reset" desc="Queue tasks and resume automatically." active={true} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'SECURITY' && (
              <motion.div key="sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 max-w-2xl">
                 <div>
                  <h2 className="text-lg font-black text-white mb-1">Security & Secrets</h2>
                  <p className="text-sm text-smash-text-secondary mb-6">Manage API keys and local environment limits.</p>
                  
                  <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                     <div className="flex items-center justify-between p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                       <div className="flex items-center gap-3">
                         <Shield size={16} className="text-violet-400" />
                         <span className="text-sm font-bold text-violet-400">Credentials Encrypted</span>
                       </div>
                       <span className="text-[10px] text-violet-400 uppercase tracking-widest font-black">ACTIVE</span>
                     </div>
                     
                     <div className="mt-4 flex flex-col gap-3">
                       <span className="text-xs font-black uppercase tracking-widest text-white">API Keys</span>
                       {[
                         { name: 'Gemini API', lastUpdated: '2 months ago' },
                         { name: 'OpenAI API', lastUpdated: '1 month ago' }
                       ].map(k => (
                         <div key={k.name} className="flex items-center justify-between border-b border-white/5 pb-3">
                           <div className="flex items-center gap-3">
                             <Key size={14} className="text-smash-text-secondary" />
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-white">{k.name}</span>
                               <span className="text-[10px] text-smash-text-tertiary">Updated {k.lastUpdated}</span>
                             </div>
                           </div>
                           <Button variant="ghost" size="sm" className="text-[10px]">REPLACE</Button>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'TEAM' && (
              <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
                 <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white mb-1">User Management</h2>
                    <p className="text-sm text-smash-text-secondary">Control team access and roles.</p>
                  </div>
                  <Button variant="primary" size="sm">INVITE USER</Button>
                </div>
                
                <div className="glass-2 border border-white/5 rounded-2xl overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20 text-[9px] uppercase tracking-widest font-black text-smash-text-tertiary">
                          <th className="p-4 border-b border-white/5 font-black">User</th>
                          <th className="p-4 border-b border-white/5 font-black">Role</th>
                          <th className="p-4 border-b border-white/5 font-black">Projects</th>
                          <th className="p-4 border-b border-white/5 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-medium text-white/90">
                        {[
                          { name: 'milkimominfo@gmail.com', role: 'OWNER', projects: 'All Projects' },
                          { name: 'designer@milkimom.com', role: 'DESIGNER', projects: 'Milkimom' },
                          { name: 'reviewer@client.com', role: 'VIEWER', projects: 'Baby Herbs' },
                        ].map((u, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="p-4 font-bold">{u.name}</td>
                            <td className="p-4"><span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-black tracking-widest">{u.role}</span></td>
                            <td className="p-4 text-smash-text-secondary">{u.projects}</td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" className="text-[10px] text-red-400 hover:bg-red-400/10 hover:text-red-300">REMOVE</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
                
                <div className="mt-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Audit Log</h3>
                   <div className="glass-2 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
                     {[
                       { action: 'Changed settings: Default Mode to Image', user: 'milkimominfo@gmail.com', time: '10 mins ago' },
                       { action: 'Deleted connection: Gemini Web #4', user: 'milkimominfo@gmail.com', time: '2 hours ago' },
                       { action: 'Approved 14 results in Baby Herbs', user: 'reviewer@client.com', time: '1 day ago' },
                     ].map((log, i) => (
                       <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                         <span className="text-xs text-white/90">{log.action}</span>
                         <div className="flex justify-between items-center text-[10px] text-smash-text-tertiary">
                           <span>{log.user}</span>
                           <span>{log.time}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
};
