import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useAccounts } from '../contexts/AccountsContext';
import { useExecution } from '../contexts/ExecutionContext';
import { useToast } from '../contexts/ToastContext';
import { PageContainer } from '../components/layout/PageContainer';
import { ModeSwitcher } from '../components/ui/ModeSwitcher';
import { CommandComposer } from '../components/workspace/CommandComposer';
import { ModelSelector } from '../components/workspace/ModelSelector';
import { ModeControls } from '../components/workspace/ModeControls';
import { LiveExecution } from '../components/workspace/LiveExecution';
import { JobInspector } from '../components/workspace/JobInspector';
import { Capability } from '../types/accounts';
import { Job, ExecutionSession } from '../types/execution';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ChevronUp, X, Sparkles, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const GenerateWorkspace: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { setCurrentMode } = useGlobalUI();
  const { connections } = useAccounts();
  const { currentSession, startSession, handleJobAction, clearSession } = useExecution();
  const { addToast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [inspectedJobId, setInspectedJobId] = useState<string | null>(null);
  const [isModelSheetOpen, setIsModelSheetOpen] = useState(false);

  const validModes = ['image', 'video', 'text', 'audio'];
  
  // Sync global mode when URL changes
  useEffect(() => {
    if (mode && validModes.includes(mode)) {
      setCurrentMode(mode);
    }
  }, [mode, setCurrentMode]);

  if (!mode || !validModes.includes(mode)) {
    return <Navigate to="/generate/text" replace />;
  }

  const currentMode = mode.toUpperCase() as Capability;

  useEffect(() => {
    setSelectedModelIds([]);
  }, [currentMode]);

  const handleSelectToggle = (id: string) => {
    setSelectedModelIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRunSmash = () => {
    const selectedConns = connections.filter(c => selectedModelIds.includes(c.id));
    startSession(currentMode, prompt, selectedConns as any);
  };

  const handleJobActionCustom = (action: string, jobId: string) => {
    if (action === 'USE_REF') {
      addToast('Image saved as reference. Switching to Video mode.', 'SUCCESS');
      navigate('/generate/video');
    } else {
      handleJobAction(action, jobId);
    }
  };

  return (
    <PageContainer 
      title={`Command Center`}
      description={`Orchestrate ${mode} generation across multiple intelligent systems.`}
      secondaryToolbar={
        <div className="w-full flex items-center justify-between">
          <ModeSwitcher 
            activeMode={currentMode as any} 
            onChange={(newMode) => navigate(`/generate/${newMode.toLowerCase()}`)} 
          />
        </div>
      }
    >
      <div className="h-full relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {!currentSession ? (
            <motion.div 
              key="composer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col lg:flex-row gap-8 pb-32 md:pb-0 overflow-y-auto"
            >
              <div className="flex-1 flex flex-col gap-6">
                <CommandComposer 
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onRun={handleRunSmash}
                  selectedCount={selectedModelIds.length}
                  activeMode={currentMode}
                />
                
                {/* Mobile Model Picker Trigger */}
                <div className="lg:hidden mt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-smash-text-tertiary mb-3 flex items-center gap-1.5">
                    <Layers size={12} /> Target Models
                  </h3>
                  <button
                    onClick={() => setIsModelSheetOpen(true)}
                    className="w-full glass-2 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm font-bold text-white">Select AI Models</span>
                      <span className="text-xs text-smash-text-secondary">{selectedModelIds.length} currently selected</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <ChevronUp size={16} />
                    </div>
                  </button>
                </div>

                <ModeControls mode={currentMode} />
              </div>

              {/* Desktop Model Selector */}
              <div className="hidden lg:flex w-[400px] h-full pb-0">
                <ModelSelector 
                  activeMode={mode}
                  selectedIds={selectedModelIds}
                  onSelectToggle={handleSelectToggle}
                  onSelectAll={setSelectedModelIds}
                />
              </div>

              {/* Mobile Model Selector Bottom Sheet */}
              <AnimatePresence>
                {isModelSheetOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsModelSheetOpen(false)}
                      className="fixed inset-0 bg-black/80 z-[100] lg:hidden backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="fixed inset-x-0 bottom-0 h-[85vh] glass-1 border-t border-white/10 rounded-t-[32px] z-[100] lg:hidden flex flex-col"
                    >
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40 rounded-t-[32px]">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Select Models</h3>
                        <Button variant="icon" onClick={() => setIsModelSheetOpen(false)} className="w-8 h-8 glass-3 text-smash-text-secondary hover:text-white">
                          <X size={16} />
                        </Button>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <ModelSelector 
                          activeMode={mode}
                          selectedIds={selectedModelIds}
                          onSelectToggle={handleSelectToggle}
                          onSelectAll={setSelectedModelIds}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Mobile Sticky Bottom Bar */}
              <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 glass-2 border-t border-white/10 z-40 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-smash-text-tertiary">
                      {selectedModelIds.length} {selectedModelIds.length === 1 ? 'Model' : 'Models'} Selected
                    </span>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleRunSmash}
                    disabled={selectedModelIds.length === 0 || !prompt.trim()}
                    className="h-12 px-6 rounded-xl font-black shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
                  >
                    <Sparkles size={16} className="mr-2" /> RUN SMASH
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="execution"
              initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 h-full flex"
            >
              <div className="flex-1 relative">
                <LiveExecution 
                  jobs={currentSession.jobs} 
                  mode={currentMode}
                  onCancel={clearSession}
                  onAction={handleJobActionCustom}
                  onJobClick={setInspectedJobId}
                />
              </div>
              
              {inspectedJobId && (
                <JobInspector 
                  job={currentSession.jobs.find(j => j.id === inspectedJobId) || null}
                  onClose={() => setInspectedJobId(null)}
                  onAction={handleJobActionCustom}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};
