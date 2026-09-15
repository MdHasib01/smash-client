import React, { useState } from 'react';
import { BrandOptions } from '../components/brands/BrandOptions';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Search, Plus, Filter, Folder, Image as ImageIcon, Video, Type, AudioLines, FileText, Bookmark, Star, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalUI } from '../contexts/GlobalUIContext';

const MOCK_ASSETS = [
  { id: '1', type: 'PRODUCT', name: 'Milkimom Jar Front', project: 'Milkimom', tags: ['PRIMARY', 'LOCKED'], url: 'https://images.unsplash.com/photo-1605296830714-7c02e1494747?q=80&w=400&auto=format&fit=crop', date: '2026-09-01' },
  { id: '2', type: 'CHARACTER', name: 'Mother A', project: 'Milkimom', tags: ['FACE'], url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', date: '2026-09-02' },
  { id: '3', type: 'STYLE', name: 'Premium Natural Light', project: 'Milkimom', tags: ['LIGHTING'], url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=400&auto=format&fit=crop', date: '2026-09-03' },
  { id: '4', type: 'LOGO', name: 'Brand Wordmark', project: 'Baby Herbs', tags: ['SVG', 'WHITE'], url: 'https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=400&auto=format&fit=crop', date: '2026-09-05' },
];

export const AssetsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'PROMPTS' | 'CAMPAIGNS'>('ASSETS');
  const { activeProject, setActiveProject } = useGlobalUI();

  return (
    <PageContainer
      title="Asset & Prompt Library"
      description="Create once. Reuse everywhere. Manage projects, assets, and templates."
    >
      <div className="flex flex-col h-full gap-6">
        
        {/* Top Controls */}
        <div className="glass-2 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Folder size={14} className="text-smash-text-secondary" />
              <select 
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#D946EF]/50 appearance-none min-w-[140px]"
              >
                <BrandOptions />
              </select>
            </div>
            
            <div className="w-px h-6 bg-white/10" />

            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              {(['ASSETS', 'PROMPTS', 'CAMPAIGNS'] as const).map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="text-[10px] w-24"
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-smash-text-secondary" />
               <input 
                 type="text" 
                 placeholder={`Search ${activeTab.toLowerCase()}...`}
                 className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-smash-text-secondary focus:outline-none focus:border-[#D946EF]/50 transition-colors w-48 focus:w-64"
               />
             </div>
             <Button variant="secondary" size="icon"><Filter size={14} /></Button>
             <Button variant="primary" size="sm">
               <Plus size={14} className="mr-2" /> 
               {activeTab === 'ASSETS' ? 'ADD ASSET' : activeTab === 'PROMPTS' ? 'NEW PROMPT' : 'NEW CAMPAIGN'}
             </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'ASSETS' && <AssetsView key="assets" />}
            {activeTab === 'PROMPTS' && <PromptsView key="prompts" />}
            {activeTab === 'CAMPAIGNS' && <CampaignsView key="campaigns" />}
          </AnimatePresence>
        </div>

      </div>
    </PageContainer>
  );
};

const AssetsView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'PRODUCT', 'CHARACTER', 'STYLE', 'LOGO', 'BACKGROUND'].map(cat => (
          <Button key={cat} variant={cat === 'ALL' ? 'secondary' : 'ghost'} size="sm" className="text-[10px] whitespace-nowrap px-4 border border-white/5">
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        {MOCK_ASSETS.map(asset => (
          <div key={asset.id} className="glass-2 border border-white/5 rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
            <div className="aspect-square relative bg-black/40 overflow-hidden">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 scale-100 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest bg-black/80 px-2 py-0.5 rounded text-white/70 border border-white/10 backdrop-blur-md">
                  {asset.type}
                </span>
                {asset.tags.includes('LOCKED') && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#D946EF]/20 text-[#D946EF] px-2 py-0.5 rounded border border-[#D946EF]/20 backdrop-blur-md flex items-center gap-1">
                    <Star size={8} className="fill-[#D946EF]" /> PRIMARY
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="icon" className="w-8 h-8 glass-3 hover:text-white"><MoreVertical size={14}/></Button>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-1 glass-1">
              <span className="text-sm font-bold text-white truncate">{asset.name}</span>
              <div className="flex justify-between items-center text-[10px] text-smash-text-tertiary">
                <span className="uppercase tracking-widest">{asset.project}</span>
                <span>{asset.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PromptsView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Premium Product Ad', tags: ['IMAGE', 'TEMPLATE'], desc: 'Generates a high-end luxury product shot with standard {{product_reference}}.' },
          { title: 'Milkimom Brand Copy', tags: ['TEXT', 'SYSTEM'], desc: 'Master system prompt enforcing brand tone, keywords, and legal constraints.' },
          { title: '4-Panel Storyboard', tags: ['IMAGE', 'WORKFLOW'], desc: 'Split layout generation for campaign storyboarding.' }
        ].map((p, i) => (
          <div key={i} className="glass-2 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 hover:border-white/20 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <div className="flex gap-2 mt-1">
                  {p.tags.map(t => (
                    <span key={t} className="text-[9px] uppercase tracking-widest text-smash-text-secondary bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{t}</span>
                  ))}
                </div>
              </div>
              <Button variant="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"><Bookmark size={14} /></Button>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-medium line-clamp-2">{p.desc}</p>
            <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 text-[10px]">USE TEMPLATE</Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CampaignsView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['September Mega Sale', 'Pumping Mothers Awareness', 'Formula Cost Comparison', 'Doctor Trust Series'].map((camp, i) => (
          <div key={i} className="glass-2 border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D946EF]/20 to-violet-500/20 border border-[#D946EF]/20 flex items-center justify-center shrink-0">
              <Folder size={20} className="text-[#D946EF]" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{camp}</h3>
              <span className="text-[10px] text-smash-text-tertiary">12 Assets • 4 Workflows</span>
            </div>
            <Button variant="icon" className="w-8 h-8"><MoreVertical size={16} /></Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
