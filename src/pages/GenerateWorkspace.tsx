import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useGlobalUI } from '../contexts/GlobalUIContext';
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
import { AgentTarget, GenerationOptions } from '../types/api';
import { useBrands } from '../contexts/BrandsContext';
import { usePersonas } from '../contexts/PersonasContext';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { ChevronUp, X, Sparkles, Layers, Wand2 } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '../components/ui/sheet';

const VALID_MODES = ['image', 'video', 'text', 'audio'];

export const GenerateWorkspace: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { setCurrentMode } = useGlobalUI();
  const { currentSession, context, isStarting, startSession, handleJobAction, clearSession } = useExecution();
  const { addToast } = useToast();
  const { activeBrand, setActiveBrandId } = useBrands();
  const { personas } = usePersonas();
  const [searchParams, setSearchParams] = useSearchParams();

  const [prompt, setPrompt] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [inspectedJobId, setInspectedJobId] = useState<string | null>(null);
  const [isModelSheetOpen, setIsModelSheetOpen] = useState(false);

  // Persona + style + per-run reference toggles. These survive a mode switch.
  // A persona's "Use" button links here as /generate/image?persona=<id>.
  const [personaId, setPersonaId] = useState<string | null>(() => searchParams.get('persona'));
  const [styleId, setStyleId] = useState<string | null>(null);
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({ aspectRatio: '1:1', outputsPerModel: 1 });
  // Which CLI + model each node-agent connection should use for this run.
  const [agentTargets, setAgentTargets] = useState<Record<string, AgentTarget>>({});
  const setAgentTarget = (connectionId: string, target: AgentTarget) =>
    setAgentTargets((prev) => ({ ...prev, [connectionId]: target }));

  const brandOfPersona = (id: string | null) => {
    const persona = personas.find((p) => p.id === id);
    if (!persona) return null;
    return typeof persona.project === 'object' ? persona.project.id : persona.project;
  };

  // A persona belongs to one brand: choosing it makes that brand active, so the
  // run - and its results - land on that brand's page.
  const handlePersonaChange = (id: string | null) => {
    setPersonaId(id);
    const brandId = brandOfPersona(id);
    if (brandId && brandId !== activeBrand?.id) setActiveBrandId(brandId);
    if (searchParams.has('persona')) {
      searchParams.delete('persona');
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Same for a persona preselected from the URL, once personas have loaded.
  useEffect(() => {
    const brandId = brandOfPersona(searchParams.get('persona'));
    if (brandId && brandId !== activeBrand?.id) setActiveBrandId(brandId);
  }, [personas, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidMode = Boolean(mode && VALID_MODES.includes(mode));

  useEffect(() => {
    if (isValidMode) setCurrentMode(mode as string);
  }, [mode, isValidMode, setCurrentMode]);

  // Must sit above the early return - hooks cannot be conditional.
  useEffect(() => {
    setSelectedModelIds([]);
  }, [mode]);

  if (!isValidMode) {
    return <Navigate to="/generate/text" replace />;
  }

  const currentMode = (mode as string).toUpperCase() as Capability;

  const handleSelectToggle = (id: string) => {
    setSelectedModelIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleRunSmash = async () => {
    if (!selectedModelIds.length || !prompt.trim() || isStarting) return;
    try {
      await startSession({
        mode: currentMode,
        prompt: prompt.trim(),
        connectionIds: selectedModelIds,
        personaId,
        projectId: activeBrand?.id ?? null,
        styleId,
        referenceIds,
        // Only IMAGE options reach a provider today.
        options: currentMode === 'IMAGE' ? options : undefined,
        // Only send choices for connections actually in this run.
        agentTargets: Object.fromEntries(
          Object.entries(agentTargets).filter(([id]) => selectedModelIds.includes(id))
        ),
      });
    } catch {
      /* ExecutionContext already surfaced the error */
    }
  };

  const handleJobActionCustom = (action: string, jobId: string) => {
    if (action === 'USE_REF') {
      addToast('Image saved as reference. Switching to Video mode.', 'SUCCESS');
      navigate('/generate/video');
    } else {
      handleJobAction(action, jobId);
    }
  };

  const canRun = selectedModelIds.length > 0 && prompt.trim().length > 0 && !isStarting;

  return (
    <PageContainer
      title="Command Center"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col lg:flex-row gap-8 pb-32 md:pb-0 overflow-y-auto"
            >
              <div className="flex-1 flex flex-col gap-6">
                <CommandComposer
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onRun={handleRunSmash}
                  selectedCount={selectedModelIds.length}
                  activeMode={currentMode}
                  isRunning={isStarting}
                  personaId={personaId}
                  onPersonaChange={handlePersonaChange}
                  styleId={styleId}
                  onStyleChange={setStyleId}
                  referenceIds={referenceIds}
                  onReferencesChange={setReferenceIds}
                />

                {/* Mobile Model Picker Trigger */}
                <div className="lg:hidden mt-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary mb-3 flex items-center gap-1.5">
                    <Layers size={12} /> Target Models
                  </h3>
                  <button
                    onClick={() => setIsModelSheetOpen(true)}
                    className="w-full glass-2 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 active:scale-[0.98] transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
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

                <ModeControls mode={currentMode} options={options} onChange={setOptions} />
              </div>

              {/* Desktop Model Selector */}
              <div className="hidden lg:flex w-[400px] h-full pb-0">
                <ModelSelector
                  activeMode={mode as string}
                  selectedIds={selectedModelIds}
                  onSelectToggle={handleSelectToggle}
                  onSelectAll={setSelectedModelIds}
                  agentTargets={agentTargets}
                  onAgentTargetChange={setAgentTarget}
                />
              </div>

              {/* Mobile Model Selector Bottom Sheet */}
              <Sheet open={isModelSheetOpen} onOpenChange={setIsModelSheetOpen}>
                <SheetContent
                  side="bottom"
                  showCloseButton={false}
                  className="lg:hidden h-[85vh] rounded-t-3xl border-t border-white/10 gap-0 p-0"
                >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40 rounded-t-3xl">
                    <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider">Select Models</SheetTitle>
                    <SheetDescription className="sr-only">Choose which AI models run this task</SheetDescription>
                    <SheetClose asChild>
                      <Button variant="icon" size="icon-sm" aria-label="Close">
                        <X size={16} />
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ModelSelector
                      activeMode={mode as string}
                      selectedIds={selectedModelIds}
                      onSelectToggle={handleSelectToggle}
                      onSelectAll={setSelectedModelIds}
                      agentTargets={agentTargets}
                      onAgentTargetChange={setAgentTarget}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile Sticky Bottom Bar */}
              <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 glass-2 border-t border-white/10 z-40 bg-black/60 backdrop-blur-xl">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary">
                    {selectedModelIds.length} {selectedModelIds.length === 1 ? 'Model' : 'Models'} Selected
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleRunSmash}
                    disabled={!canRun}
                    isLoading={isStarting}
                    className="h-12 px-6 rounded-xl tracking-wide"
                  >
                    <Sparkles size={16} /> RUN SMASH
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="execution"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full flex flex-col"
            >
              {/* What the compiler actually sent - so a persona run is explainable. */}
              {context?.personaName && (
                <details className="shrink-0 mb-3 glass-3 border border-white/10 rounded-xl px-4 py-2.5 text-xs">
                  <summary className="cursor-pointer flex items-center gap-2 text-smash-text-secondary select-none">
                    <Wand2 size={12} className="text-[#D946EF]" />
                    <span className="font-bold text-white">{context.personaName}</span>
                    {context.styleName && <span>· {context.styleName}</span>}
                    <span>· {context.references.length} reference(s)</span>
                    <span>
                      · {context.compiledBy === 'NODE_AGENT' ? 'refined by local agent' : 'assembled prompt'}
                    </span>
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-smash-text-secondary max-h-48 overflow-y-auto">
                    {context.finalPrompt}
                  </pre>
                  {context.compileNote && (
                    <p className="mt-1 text-[11px] text-amber-300/80">Note: {context.compileNote}</p>
                  )}
                </details>
              )}

              <div className="flex-1 relative flex min-h-0">
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
                    job={currentSession.jobs.find((j) => j.id === inspectedJobId) || null}
                    onClose={() => setInspectedJobId(null)}
                    onAction={handleJobActionCustom}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};
