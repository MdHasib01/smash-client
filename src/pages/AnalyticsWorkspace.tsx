import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { LineChart, BarChart2, Activity, Zap, Server, ShieldAlert, Cpu, Layers, DollarSign, Download, Clock, Filter, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const KPICard = ({ title, value, sub, icon, colorClass }: { title: string, value: string, sub?: string, icon: React.ReactNode, colorClass: string }) => (
  <div className="glass-2 border border-white/5 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-all">
    <div className={cn("absolute -right-6 -top-6 w-24 h-24 blur-[40px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40", colorClass)} />
    <div className="flex items-center justify-between z-10">
      <span className="text-[10px] font-black uppercase tracking-widest text-smash-text-secondary">{title}</span>
      <div className={cn("text-white/50", colorClass.replace('bg-', 'text-'))}>{icon}</div>
    </div>
    <div className="flex flex-col gap-1 z-10">
      <span className="text-3xl font-black text-white tracking-tight">{value}</span>
      {sub && <span className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary">{sub}</span>}
    </div>
  </div>
);

export const AnalyticsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROVIDERS' | 'COST' | 'LIMITS'>('OVERVIEW');
  const [timeRange, setTimeRange] = useState('30D');

  return (
    <PageContainer
      title="Analytics & Intelligence"
      description="Operational metrics, provider performance, cost tracking, and system health."
    >
      <div className="flex flex-col h-full gap-6 pb-20">
        
        {/* Toolbar */}
        <div className="glass-2 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['OVERVIEW', 'PROVIDERS', 'COST', 'LIMITS'] as const).map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="text-[10px] px-4"
              >
                {tab}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/10">
               {['1D', '7D', '30D', '90D'].map(tr => (
                 <button 
                   key={tr} 
                   onClick={() => setTimeRange(tr)}
                   className={cn("text-[10px] font-bold px-2 py-1 rounded transition-colors", timeRange === tr ? "bg-white/10 text-white" : "text-smash-text-tertiary hover:text-white")}
                 >
                   {tr}
                 </button>
               ))}
             </div>
             <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-[#D946EF]/50 appearance-none">
               <option>ALL PROJECTS</option>
               <option>MILKIMOM</option>
               <option>BABY HERBS</option>
             </select>
             <Button variant="secondary" size="icon" className="h-8 w-8"><Download size={14}/></Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {activeTab === 'OVERVIEW' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard title="Total Tasks" value="12,420" sub="+14% vs last period" icon={<Layers size={18}/>} colorClass="bg-[#D946EF]" />
                  <KPICard title="Success Rate" value="96.8%" sub="0.2% technical failures" icon={<Activity size={18}/>} colorClass="bg-violet-500" />
                  <KPICard title="Total Outputs" value="84,102" sub="Avg 6.7 outputs/task" icon={<Server size={18}/>} colorClass="bg-violet-500" />
                  <KPICard title="Est. API Cost" value="$142.50" sub="Saved $40 via Local Models" icon={<DollarSign size={18}/>} colorClass="bg-rose-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mock Chart Area */}
                  <div className="lg:col-span-2 glass-1 border border-white/5 p-6 rounded-3xl flex flex-col gap-6 h-[400px]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-white">Execution Volume</span>
                      <Button variant="ghost" size="sm" className="text-[10px]"><Filter size={12} className="mr-1"/> Filter</Button>
                    </div>
                    <div className="flex-1 flex items-end gap-2 relative">
                       {/* Extremely simple mock bar chart for visuals */}
                       {Array.from({ length: 30 }).map((_, i) => (
                         <div key={i} className="flex-1 bg-white/5 hover:bg-[#D946EF]/50 transition-colors rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
                       ))}
                       <div className="absolute inset-x-0 bottom-0 border-b border-white/10" />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-smash-text-tertiary uppercase tracking-widest">
                      <span>Start of period</span>
                      <span>End of period</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="glass-1 border border-white/5 p-6 rounded-3xl flex flex-col gap-5 flex-1">
                      <span className="text-xs font-black uppercase tracking-widest text-white">Mode Breakdown</span>
                      <div className="flex flex-col gap-4">
                        {[
                          { name: 'IMAGE', count: '6,420', pct: 60, color: 'bg-violet-500' },
                          { name: 'TEXT', count: '4,200', pct: 40, color: 'bg-violet-500' },
                          { name: 'VIDEO', count: '920', pct: 15, color: 'bg-fuchsia-500' },
                          { name: 'AUDIO', count: '880', pct: 10, color: 'bg-[#D946EF]' },
                        ].map(mode => (
                          <div key={mode.name} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-white/80">{mode.name}</span>
                              <span className="text-smash-text-secondary">{mode.count} Tasks</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", mode.color)} style={{ width: `${mode.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'PROVIDERS' && (
              <motion.div key="providers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <div className="glass-1 border border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <span className="text-xs font-black uppercase tracking-widest text-white">Provider Performance Matrix</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20 text-[9px] uppercase tracking-widest font-black text-smash-text-tertiary">
                          <th className="p-4 border-b border-white/5 font-black">Provider</th>
                          <th className="p-4 border-b border-white/5 font-black">Tasks</th>
                          <th className="p-4 border-b border-white/5 font-black">Success %</th>
                          <th className="p-4 border-b border-white/5 font-black">Avg Time</th>
                          <th className="p-4 border-b border-white/5 font-black">User Approval</th>
                          <th className="p-4 border-b border-white/5 font-black">Retries</th>
                          <th className="p-4 border-b border-white/5 font-black">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-medium text-white/90">
                        {[
                          { name: 'Gemini', tasks: '5,420', success: '98%', time: '14s', approval: '76%', retries: '124', cost: '$42.10' },
                          { name: 'OpenAI', tasks: '3,800', success: '99%', time: '18s', approval: '81%', retries: '42', cost: '$86.50' },
                          { name: 'Claude', tasks: '2,100', success: '97%', time: '22s', approval: '79%', retries: '68', cost: '$14.00' },
                          { name: 'Local (Flux)', tasks: '1,100', success: '94%', time: '45s', approval: '88%', retries: '14', cost: '$0.00' },
                        ].map((p, i) => (
                          <tr key={p.name} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0 cursor-pointer">
                            <td className="p-4 font-bold">{p.name}</td>
                            <td className="p-4 font-mono">{p.tasks}</td>
                            <td className="p-4"><span className="text-violet-400 font-bold">{p.success}</span></td>
                            <td className="p-4 font-mono">{p.time}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                 <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden"><div className="h-full bg-[#D946EF] rounded-full" style={{ width: p.approval }} /></div>
                                 <span className="font-mono text-[10px]">{p.approval}</span>
                               </div>
                            </td>
                            <td className="p-4 text-rose-400">{p.retries}</td>
                            <td className="p-4 font-mono text-smash-text-secondary">{p.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'LIMITS' && (
              <motion.div key="limits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KPICard title="Limit Events" value="142" sub="Across all accounts" icon={<ShieldAlert size={18}/>} colorClass="bg-red-500" />
                  <KPICard title="Tasks Delayed" value="84" sub="Auto-resumed later" icon={<Clock size={18}/>} colorClass="bg-rose-500" />
                  <KPICard title="Violation Retries" value="42" sub="SMASH auto-corrected 35" icon={<AlertTriangle size={18}/>} colorClass="bg-rose-500" />
                </div>
                
                <div className="glass-1 border border-white/5 rounded-3xl p-6">
                   <span className="text-xs font-black uppercase tracking-widest text-white mb-6 block">Active Again History</span>
                   <div className="flex flex-col gap-4">
                     {[
                       { acc: 'Gemini Web #3', duration: '2h 14m', affected: 12, time: '2 hours ago' },
                       { acc: 'Claude Web #1', duration: '4h 00m', affected: 4, time: 'Yesterday' },
                       { acc: 'OpenAI API', duration: '1m', affected: 1, time: 'Yesterday' },
                     ].map((l, i) => (
                       <div key={i} className="flex items-center justify-between p-4 glass-2 rounded-xl border border-white/5">
                         <div className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">{l.acc}</span>
                             <span className="text-[10px] uppercase font-bold text-smash-text-secondary">Limited for {l.duration}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-6 text-right">
                           <div className="flex flex-col">
                             <span className="text-xs font-mono text-white">{l.affected}</span>
                             <span className="text-[9px] uppercase font-bold text-smash-text-tertiary">Tasks Delayed</span>
                           </div>
                           <span className="text-[10px] uppercase font-bold text-smash-text-tertiary w-20">{l.time}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'COST' && (
              <motion.div key="cost" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KPICard title="Month-to-Date Spend" value="$142.50" sub="Budget: $500.00" icon={<DollarSign size={18}/>} colorClass="bg-violet-500" />
                  <KPICard title="Cost / Approved Result" value="$0.12" sub="Across paid APIs" icon={<TrendingUp size={18}/>} colorClass="bg-[#D946EF]" />
                  <KPICard title="Local Savings" value="~$40.00" sub="Est. vs cloud generation" icon={<Cpu size={18}/>} colorClass="bg-violet-500" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
};
