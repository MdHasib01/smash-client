import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Sparkles, Video, Type, AudioLines, Image as ImageIcon, Activity, AlertTriangle, ChevronRight, Zap, PlayCircle, History, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../contexts/AccountsContext';

const MOCK_ACTIVE = [
  { id: 'TSK-1051', type: 'IMAGE', title: 'Premium product hero shot...', status: 'RUNNING', models: 4, progress: 65 },
  { id: 'TSK-1052', type: 'VIDEO', title: 'Milkimom commercial reel...', status: 'QUEUED', models: 1, progress: 0 },
];

const MOCK_RESULTS = [
  { id: '1', title: 'Product Shot v4', mode: 'IMAGE', url: 'https://images.unsplash.com/photo-1605296830714-7c02e1494747?w=200&q=80', score: 92 },
  { id: '2', title: 'Organic Campaign Copy', mode: 'TEXT', url: null, text: 'The purest ingredients for your...', score: 88 },
  { id: '3', title: 'Ad Storyboard', mode: 'IMAGE', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80', score: 95 },
  { id: '4', title: 'Voiceover Intro', mode: 'AUDIO', url: null, score: 85 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { connections } = useAccounts();

  const activeConnectionsCount = connections.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').length;
  const limitedConnectionsCount = connections.filter(c => c.status === 'LIMIT_REACHED').length;
  const isHealthy = activeConnectionsCount > 0;
  
  const limitedConnections = connections.filter(c => c.status === 'LIMIT_REACHED');

  return (
    <PageContainer
      title=""
      description=""
      className="pb-24 pt-4"
    >
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 glass-1 border border-white/10 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 blur-[100px] pointer-events-none" />
            
            <div className="z-10 flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">SMASH</h1>
              <p className="text-smash-text-secondary font-medium tracking-wide uppercase text-xs">Smart Multi-AI System Hub</p>
            </div>
            
            <div className="z-10 flex flex-col gap-4 mt-8">
              <div className="text-sm font-bold text-white/90 mb-2">New Task</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'image', label: 'IMAGE', icon: <ImageIcon size={20} />, color: 'hover:border-violet-500 hover:text-violet-400' },
                  { id: 'video', label: 'VIDEO', icon: <Video size={20} />, color: 'hover:border-fuchsia-500 hover:text-fuchsia-400' },
                  { id: 'text', label: 'TEXT', icon: <Type size={20} />, color: 'hover:border-violet-500 hover:text-violet-400' },
                  { id: 'audio', label: 'AUDIO', icon: <AudioLines size={20} />, color: 'hover:border-[#D946EF] hover:text-[#D946EF]' },
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => navigate(`/generate/${mode.id}`)}
                    className={cn("glass-2 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group", mode.color)}
                  >
                    <div className="text-white/70 group-hover:text-inherit transition-colors">{mode.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* QUICK STATS & HEALTH */}
          <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
            <div className="glass-2 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] uppercase font-black tracking-widest text-smash-text-secondary">System Health</span>
                 <span className={cn(
                   "flex items-center gap-1.5 text-[10px] uppercase font-black px-2 py-0.5 rounded border",
                   isHealthy ? "text-violet-400 bg-violet-400/10 border-violet-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
                 )}>
                   <Activity size={10} /> {isHealthy ? 'Operational' : 'Critical'}
                 </span>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-2">
                 <div className="flex flex-col gap-1">
                   <span className="text-2xl font-black text-white">{activeConnectionsCount}</span>
                   <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Active Conns</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-2xl font-black text-rose-400">{limitedConnectionsCount}</span>
                   <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Limited</span>
                 </div>
               </div>
            </div>
            
            {limitedConnections.length > 0 && (
              <div className="glass-2 border border-white/5 p-5 rounded-2xl flex flex-col gap-3">
                 <span className="text-[10px] uppercase font-black tracking-widest text-smash-text-secondary">Limited Accounts</span>
                 {limitedConnections.map(conn => (
                   <div key={conn.id} className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl mb-2 last:mb-0">
                     <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">{conn.name}</span>
                       <span className="text-[10px] text-rose-400">{conn.limitState || 'Limit Reached'}</span>
                     </div>
                     <AlertTriangle size={14} className="text-rose-400" />
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* OPERATIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Operations */}
          <div className="flex flex-col gap-4 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
               <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><Zap size={14} className="text-[#D946EF]" /> Live Operations</h2>
               <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => navigate('/history')}>VIEW ALL</Button>
            </div>
            
            <div className="flex flex-col gap-3">
              {MOCK_ACTIVE.map(task => (
                <div key={task.id} className="glass-1 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg glass-3 flex items-center justify-center shrink-0">
                    {task.status === 'RUNNING' ? <div className="w-4 h-4 rounded-full border-2 border-[#D946EF] border-t-transparent animate-spin" /> : <Clock size={16} className="text-smash-text-secondary" />}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white truncate">{task.title}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-smash-text-secondary">{task.models} Models</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", task.status === 'RUNNING' ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-white/20")} style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right text-white/50">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><History size={14} className="text-[#D946EF]" /> Today's Snapshot</h2>
               <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => navigate('/analytics')}>DETAILS</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="glass-1 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Tasks</span>
                 <span className="text-xl font-black text-white">1,204</span>
               </div>
               <div className="glass-1 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Success Rate</span>
                 <span className="text-xl font-black text-violet-400">98.2%</span>
               </div>
               <div className="glass-1 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Outputs</span>
                 <span className="text-xl font-black text-white">4,816</span>
               </div>
               <div className="glass-1 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <span className="text-[10px] uppercase font-bold text-smash-text-secondary">API Spend</span>
                 <span className="text-xl font-black text-rose-400">$12.40</span>
               </div>
            </div>
          </div>
        </div>

        {/* RECENT RESULTS */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><PlayCircle size={14} className="text-violet-400" /> Recent Results</h2>
             <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => navigate('/results')}>GALLERY</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_RESULTS.map((res) => (
              <div key={res.id} onClick={() => navigate('/results')} className="glass-1 border border-white/5 rounded-2xl overflow-hidden cursor-pointer group hover:border-white/20 transition-all h-32 relative">
                {res.url ? (
                  <img src={res.url} alt="" className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 scale-100 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-black/40">
                    <span className="text-xs font-medium text-white/70 line-clamp-3 text-center">{res.text || 'Audio Output'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{res.title}</span>
                  <span className="text-[9px] uppercase tracking-widest text-smash-text-tertiary">{res.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
