import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, History, ChevronRight, Activity, Cpu, AlertTriangle, Play, Edit3, Image, Users, Folder } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalUI } from '../contexts/GlobalUIContext';

const MOCK_HISTORY = [
  { id: 'TSK-1049', project: 'Milkimom', mode: 'IMAGE', prompt: 'Premium product hero shot with morning sunlight...', models: 4, results: 12, status: 'COMPLETE', date: '2 mins ago', cost: '$0.04' },
  { id: 'TSK-1048', project: 'Baby Herbs', mode: 'TEXT', prompt: 'Write a landing page copy emphasizing organic...', models: 2, results: 2, status: 'COMPLETE', date: '1 hour ago', cost: '$0.01' },
  { id: 'TSK-1047', project: 'Milkimom', mode: 'IMAGE', prompt: 'A futuristic smart home AI control hub...', models: 6, results: 5, status: 'WARNING', date: '3 hours ago', cost: '$0.08', note: '1 Limit Event' },
];

export const HistoryWorkspace: React.FC = () => {
  const { activeProject, setActiveProject } = useGlobalUI();
  const [activeTab, setActiveTab] = useState<'TASKS' | 'PROMPTS'>('TASKS');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <PageContainer
      title="Execution History"
      description="Complete audit log of every generation, retry, and orchestration session."
    >
      <div className="flex flex-col h-full gap-6">
        
        {/* Toolbar */}
        <div className="glass-2 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Folder size={14} className="text-smash-text-secondary" />
              <select 
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#D946EF]/50 appearance-none min-w-[140px]"
              >
                <option value="Milkimom">Milkimom</option>
                <option value="Baby Herbs">Baby Herbs</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            
            <div className="w-px h-6 bg-white/10" />

            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <Button variant={activeTab === 'TASKS' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('TASKS')} className="text-[10px] w-24">TASK HISTORY</Button>
              <Button variant={activeTab === 'PROMPTS' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('PROMPTS')} className="text-[10px] w-28">PROMPT HISTORY</Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-smash-text-secondary" />
               <input 
                 type="text" 
                 placeholder="Search history..."
                 className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-smash-text-secondary focus:outline-none focus:border-[#D946EF]/50 transition-colors w-48 focus:w-64"
               />
             </div>
             <Button variant="secondary" size="sm" className="h-8 text-[10px]"><Filter size={12} className="mr-1.5"/> FILTERS</Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-20 flex flex-col gap-3">
          {MOCK_HISTORY.map((task) => {
            const isExpanded = expandedId === task.id;
            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass-1 border border-white/5 rounded-2xl flex flex-col transition-all overflow-hidden",
                  isExpanded ? "border-[#D946EF]/30 bg-white/[0.03]" : "hover:border-white/20 hover:bg-white/[0.02]"
                )}
              >
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                >
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl glass-3 flex items-center justify-center shrink-0 border border-white/10">
                      <History size={16} className="text-white/70" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs font-bold text-white">{task.id}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-smash-text-tertiary flex items-center gap-1.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full", task.status === 'COMPLETE' ? "bg-violet-400" : "bg-rose-400")} />
                         {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-white/90 font-medium truncate">{task.prompt}</p>
                    <div className="flex items-center gap-3 text-[10px] text-smash-text-secondary font-bold uppercase tracking-widest">
                      <span className="text-[#D946EF] border border-[#D946EF]/20 bg-[#D946EF]/10 px-1.5 py-0.5 rounded">{task.project}</span>
                      <span>{task.mode}</span>
                      <span className="flex items-center gap-1"><Cpu size={10}/> {task.models} Models</span>
                      <span className="flex items-center gap-1"><Activity size={10}/> {task.results} Results</span>
                      {task.note && <span className="flex items-center gap-1 text-rose-400"><AlertTriangle size={10}/> {task.note}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-sm font-bold text-white">{task.cost}</span>
                      <span className="text-[10px] text-smash-text-tertiary uppercase tracking-widest">{task.date}</span>
                    </div>
                    <ChevronRight size={16} className={cn("text-white/20 transition-transform", isExpanded && "rotate-90")} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/40"
                    >
                      <div className="p-5 flex flex-wrap gap-2">
                        <Button variant="primary" size="sm" className="h-8 text-[10px]"><Play size={12} className="mr-1.5 fill-white"/> RUN AGAIN</Button>
                        <Button variant="secondary" size="sm" className="h-8 text-[10px]"><Edit3 size={12} className="mr-1.5"/> EDIT & RUN</Button>
                        <Button variant="secondary" size="sm" className="h-8 text-[10px]"><Users size={12} className="mr-1.5"/> CHANGE MODELS</Button>
                        <Button variant="secondary" size="sm" className="h-8 text-[10px]"><Image size={12} className="mr-1.5"/> CHANGE REFERENCES</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </PageContainer>
  );
};
