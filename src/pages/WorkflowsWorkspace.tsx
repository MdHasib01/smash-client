import React, { useState, useCallback, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Play, Save, Settings, Plus, Network, Cpu, LayoutTemplate, MessageSquare, Download, Activity, Folder, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useToast } from '../contexts/ToastContext';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  ReactFlowProvider,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- CUSTOM NODES ---

const PromptNode = ({ data, selected }: NodeProps) => (
  <div className={cn("glass-2 border-2 rounded-xl p-4 min-w-[240px] transition-all", selected ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/10", data.executing && "border-[#D946EF] ring-4 ring-[#D946EF]/20")}>
    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
      <MessageSquare size={14} className={data.executing ? "text-[#D946EF] animate-pulse" : "text-[#D946EF]"} />
      <span className="text-xs font-black text-white uppercase tracking-widest">Input: Prompt</span>
      {data.completed && <CheckCircle size={14} className="text-violet-400 ml-auto" />}
    </div>
    <div className="text-[10px] text-white/70 bg-black/40 p-2 rounded border border-white/5 h-16 overflow-hidden">
      {data.prompt || "Enter prompt..."}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#D946EF] border-none" />
  </div>
);

const MultiAINode = ({ data, selected }: NodeProps) => (
  <div className={cn("glass-2 border-2 rounded-xl p-4 min-w-[240px] transition-all", selected ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/10", data.executing && "border-[#D946EF] ring-4 ring-[#D946EF]/20")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-none" />
    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <Network size={14} className={data.executing ? "text-[#D946EF] animate-pulse" : "text-[#D946EF]"} />
        <span className="text-xs font-black text-white uppercase tracking-widest">Multi-AI Batch</span>
        {data.completed && <CheckCircle size={14} className="text-violet-400 ml-auto" />}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-smash-text-secondary">Mode</span>
        <span className="text-white font-bold">{data.mode || 'IMAGE'}</span>
      </div>
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-smash-text-secondary">Selected Models</span>
        <span className="text-white font-bold bg-[#D946EF]/20 text-[#D946EF] px-1.5 py-0.5 rounded">{data.models || 0}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#D946EF] border-none" />
  </div>
);

const JudgeNode = ({ data, selected }: NodeProps) => (
  <div className={cn("glass-2 border-2 rounded-xl p-4 min-w-[240px] transition-all", selected ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/10", data.executing && "border-[#D946EF] ring-4 ring-[#D946EF]/20")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#D946EF] border-none" />
    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <Activity size={14} className={data.executing ? "text-[#D946EF] animate-pulse" : "text-violet-400"} />
        <span className="text-xs font-black text-white uppercase tracking-widest">AI Judge</span>
        {data.completed && <CheckCircle size={14} className="text-violet-400 ml-auto" />}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-smash-text-secondary">Keep Top</span>
        <span className="text-white font-bold">{data.keepTop || 3}</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-400 border-none" />
  </div>
);

const ExportNode = ({ data, selected }: NodeProps) => (
  <div className={cn("glass-2 border-2 rounded-xl p-4 min-w-[240px] transition-all", selected ? "border-[#D946EF] shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/10", data.executing && "border-[#D946EF] ring-4 ring-[#D946EF]/20")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-violet-400 border-none" />
    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
      <Download size={14} className={data.executing ? "text-[#D946EF] animate-pulse" : "text-rose-400"} />
      <span className="text-xs font-black text-white uppercase tracking-widest">Export / Save</span>
      {data.completed && <CheckCircle size={14} className="text-violet-400 ml-auto" />}
    </div>
    <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest text-center py-2">
      {data.action || 'SAVE TO ASSETS'}
    </div>
  </div>
);

const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 250, y: 50 }, data: { prompt: 'Create a premium product ad for Milkimom...' } },
  { id: '2', type: 'multiAI', position: { x: 250, y: 220 }, data: { mode: 'IMAGE', models: 6 } },
  { id: '3', type: 'judge', position: { x: 250, y: 390 }, data: { keepTop: 3 } },
  { id: '4', type: 'export', position: { x: 250, y: 540 }, data: { action: 'SAVE TO ASSETS' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#fff', opacity: 0.5, strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#D946EF', opacity: 0.8, strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#34d399', opacity: 0.8, strokeWidth: 2 } },
];

const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { activeProject } = useGlobalUI();

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff', strokeWidth: 2, opacity: 0.5 } } as any, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({
    prompt: PromptNode,
    multiAI: MultiAINode,
    judge: JudgeNode,
    export: ExportNode,
  }), []);

  const handleTestRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    toast('Test Run Started', `Executing pipeline for ${activeProject}...`, 'info');
    
    const setNodeExecuting = (id: string, executing: boolean, completed: boolean) => {
      setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, executing, completed } } : n));
    };
    
    // Reset all
    setNodes(nds => nds.map(n => ({...n, data: { ...n.data, executing: false, completed: false}})));

    setTimeout(() => {
      setNodeExecuting('1', true, false);
      
      setTimeout(() => {
        setNodeExecuting('1', false, true);
        setNodeExecuting('2', true, false);
        
        setTimeout(() => {
          setNodeExecuting('2', false, true);
          setNodeExecuting('3', true, false);
          
          setTimeout(() => {
            setNodeExecuting('3', false, true);
            setNodeExecuting('4', true, false);
            
            setTimeout(() => {
              setNodeExecuting('4', false, true);
              setIsRunning(false);
              toast('Workflow Complete', 'Top 3 generated results saved to Assets.', 'success');
            }, 1000);
          }, 1500);
        }, 2000);
      }, 800);
    }, 500);
  };

  return (
    <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden glass-1 border border-white/10">
      
      {/* Editor Header */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-md border-b border-white/5 z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <LayoutTemplate size={16} className="text-[#D946EF]" />
          <h2 className="text-sm font-bold text-white">Multi-AI Image Battle</h2>
          <span className="text-[10px] text-smash-text-secondary uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">v3 CURRENT</span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] text-smash-text-secondary uppercase tracking-widest mr-2">Auto-saved 2m ago</span>
           <Button variant="secondary" size="sm" className="h-8 text-[10px]" disabled={isRunning}><Settings size={14} className="mr-1.5"/> SETTINGS</Button>
           <Button variant="secondary" size="sm" className="h-8 text-[10px]" disabled={isRunning}><Save size={14} className="mr-1.5"/> SAVE</Button>
           <Button 
            variant="primary" 
            size="sm" 
            className="h-8 text-[10px]"
            onClick={handleTestRun}
            disabled={isRunning}
           >
            {isRunning ? <Activity size={14} className="mr-1.5 animate-spin"/> : <Play size={14} className="mr-1.5 fill-white"/>}
            {isRunning ? 'RUNNING...' : 'TEST RUN'}
           </Button>
        </div>
      </div>

      {/* Nodes Panel */}
      <div className="absolute left-6 top-20 z-10 w-48 glass-2 border border-white/10 p-3 rounded-2xl flex flex-col gap-2 max-h-[calc(100%-120px)] overflow-y-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-smash-text-secondary mb-1">Add Node</span>
        {[
          { icon: <MessageSquare size={14}/>, label: 'INPUT' },
          { icon: <Network size={14}/>, label: 'MULTI-AI' },
          { icon: <Cpu size={14}/>, label: 'SINGLE AI' },
          { icon: <Activity size={14}/>, label: 'JUDGE' },
          { icon: <Network size={14}/>, label: 'CONDITION' },
          { icon: <Settings size={14}/>, label: 'RETRY' },
          { icon: <Settings size={14}/>, label: 'FALLBACK' },
          { icon: <Settings size={14}/>, label: 'ASSET' },
          { icon: <Settings size={14}/>, label: 'TRANSFORM' },
          { icon: <Settings size={14}/>, label: 'APPROVAL' },
          { icon: <Download size={14}/>, label: 'EXPORT' },
          { icon: <Settings size={14}/>, label: 'NOTIFICATION' }
        ].map(n => (
          <Button key={n.label} variant="ghost" size="sm" className="w-full justify-start text-[10px] text-white/70 hover:text-white border border-transparent hover:border-white/10" disabled={isRunning}>
            {n.icon} <span className="ml-2">{n.label}</span>
          </Button>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black/20"
      >
        <Background color="#ffffff" gap={24} size={1} opacity={0.05} />
        <Controls className="glass-2 border-white/10 fill-white !bottom-6 !left-6" showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export const WorkflowsWorkspace: React.FC = () => {
  const { activeProject, setActiveProject } = useGlobalUI();

  return (
    <PageContainer
      title="Workflow Builder"
      description="Design reusable multi-AI generation pipelines with conditional logic and auto-evaluations."
      secondaryToolbar={
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
      }
    >
      <div className="flex flex-col h-full gap-6 pb-20">
        <ReactFlowProvider>
          <WorkflowBuilder />
        </ReactFlowProvider>
      </div>
    </PageContainer>
  );
};
