import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Globe, Terminal, Code, Link, Cpu, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAccounts, ConnectionType } from '../../contexts/AccountsContext';

export const AddConnectionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [connectionName, setConnectionName] = useState('Custom API Primary');
  const [providerName, setProviderName] = useState('Google');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash-image');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [checkMessage, setCheckMessage] = useState<string>('');
  const { createConnection, testConnection } = useAccounts();

  // Only Google has a real adapter today; other providers run on the simulator.
  const adapterFor = (provider: string) => (provider === 'Google' ? 'GEMINI' : 'SIMULATOR');

  const connectionTypes = [
    { id: 'API', icon: Code, label: 'API Connection', desc: 'Direct REST API key access' },
    { id: 'BROWSER', icon: Globe, label: 'Browser Login', desc: 'Isolated web session automation' },
    { id: 'LOCAL', icon: Cpu, label: 'Local Model', desc: 'Ollama, LM Studio, localhost' },
    { id: 'OPEN_SOURCE', icon: Terminal, label: 'Open Source', desc: 'vLLM, RunPod, Hugging Face' },
    { id: 'CUSTOM', icon: Link, label: 'Custom REST', desc: 'Map any custom endpoint' },
  ];

  /** Create on the server, then run a real health check - no more mock success. */
  const handleCreateAndTest = async () => {
    setSaveError(null);
    setStep(3);
    try {
      const adapter = adapterFor(providerName);
      const created = await createConnection({
        name: connectionName.trim() || `${providerName} connection`,
        provider: providerName,
        model: modelName.trim(),
        type: (selectedType || 'API') as ConnectionType,
        adapter,
        capabilities: adapter === 'GEMINI' ? ['IMAGE', 'TEXT'] : ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'],
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      } as any);
      const check = await testConnection(created.id);
      setCheckMessage(check?.message ?? '');
      setStep(4);
    } catch (err) {
      setSaveError((err as Error).message);
      setStep(2);
    }
  };

  const handleSaveConnection = () => {
    setApiKey('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[85vh] glass-1 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl shadow-black/80"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight text-white">Add Connection</h2>
            <p className="text-xs text-smash-text-secondary mt-1 font-medium">Connect a new AI source to SMASH infrastructure.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn("w-8 h-1.5 rounded-full transition-colors", step >= s ? "bg-[#D946EF]" : "bg-white/10")} />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <h3 className="text-sm font-black tracking-widest uppercase text-smash-text-tertiary">1. Select Connection Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300",
                        selectedType === type.id 
                          ? "glass-2 border-[#D946EF]/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-[#D946EF]" 
                          : "glass-3 border-white/5 hover:border-white/20 hover:bg-white/5"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", selectedType === type.id ? "bg-gradient-primary text-white" : "bg-white/5 text-smash-text-secondary")}>
                        <type.icon size={20} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={cn("font-black text-sm", selectedType === type.id ? "text-white" : "text-smash-text-secondary")}>{type.label}</span>
                        <span className="text-xs text-smash-text-tertiary">{type.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <h3 className="text-sm font-black tracking-widest uppercase text-smash-text-tertiary">2. Configure Details</h3>
                <div className="flex flex-col gap-5 max-w-xl">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Connection Name</label>
                    <Input 
                      placeholder="e.g. Gemini API Primary" 
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Google', 'OpenAI', 'Anthropic'].map(p => (
                        <div 
                          key={p} 
                          onClick={() => setProviderName(p)}
                          className={cn("p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-colors", providerName === p ? "bg-white/10 border-white/30 text-white" : "glass-3 border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80")}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">API Key / Endpoint</label>
                      <span className="text-[9px] text-violet-400 font-bold flex items-center gap-1"><ShieldCheck size={10}/> Secure</span>
                    </div>
                    <Input
                      type="password"
                      placeholder={providerName === 'Google' ? 'AIza...' : 'sk-...'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <span className="text-[10px] text-smash-text-tertiary">
                      Encrypted on the server; only the last 4 characters are ever shown again.
                      {adapterFor(providerName) === 'SIMULATOR' && ' No real adapter for this provider yet - it will run in simulation.'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">Model</label>
                    <Input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="gemini-2.5-flash-image" />
                  </div>
                  {saveError && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">{saveError}</div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center justify-center h-full gap-6 text-center py-10"
              >
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#D946EF] animate-spin" />
                  <Globe size={32} className="text-[#D946EF]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black text-white">Testing Connection...</h3>
                  <p className="text-sm text-smash-text-secondary max-w-sm">Saving and checking {providerName}. Please wait.</p>
                </div>
              </motion.div>
            )}
            
             {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full gap-6 text-center py-10"
              >
                <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                  <CheckCircle2 size={40} className="text-violet-400" />
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <h3 className="text-2xl font-black text-white">Connection Saved</h3>
                  <p className="text-sm text-smash-text-secondary max-w-sm"><strong className="text-white">{connectionName}</strong> has been added to your workspace.</p>
                  {checkMessage && <p className="text-xs text-smash-text-tertiary">Health check: {checkMessage}</p>}
                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">TEXT</div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">IMAGE</div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">VIDEO</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-white/5 flex justify-between items-center glass-2 shrink-0">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step === 1 && (
            <Button variant="primary" disabled={!selectedType} onClick={() => setStep(2)}>
              Continue <ArrowRight size={16} />
            </Button>
          )}
          {step === 2 && (
            <Button variant="primary" onClick={handleCreateAndTest}>
              Save & Test <ArrowRight size={16} />
            </Button>
          )}
          {step === 4 && (
            <Button variant="primary" onClick={handleSaveConnection}>
              Save & Use
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
