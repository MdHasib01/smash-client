import * as React from "react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input, Textarea } from "./ui/Input";
import { ModeSwitcher, Mode } from "./ui/ModeSwitcher";
import { Logo } from "./ui/Logo";
import { StatusIndicator, StatusState } from "./ui/StatusIndicator";
import { Search, Sparkles, Send, Settings, Terminal, Box } from "lucide-react";

export const DesignSystemShowcase: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>('TEXT');

  const statusStates: StatusState[] = [
    'IDLE', 'QUEUED', 'GENERATING', 'PROCESSING', 
    'RETRYING', 'LIMIT_REACHED', 'PAUSED', 'FAILED', 
    'COMPLETE', 'ACTIVE_AGAIN'
  ];

  return (
    <div className="min-h-screen p-8 md:p-12 lg:p-24 space-y-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <Logo size="lg" />
        <Badge variant="outline" className="px-3 py-1">Design System v1.0</Badge>
      </header>

      {/* Glassmorphism System */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight leading-none">Glassmorphism System</h2>
          <p className="text-smash-text-secondary">Three distinct levels of depth and blur.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card level={1} className="p-8 h-64 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Glass Level 1</h3>
              <p className="text-sm text-smash-text-secondary mt-1">Main large panels. Heavy blur, high opacity.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="w-8 h-8 rounded-full bg-white/5" />
            </div>
          </Card>
          <Card level={2} className="p-8 h-64 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Glass Level 2</h3>
              <p className="text-sm text-smash-text-secondary mt-1">Cards, items. Medium blur, inner shadow.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="connection">API</Badge>
              <Badge variant="connection">LOCAL</Badge>
            </div>
          </Card>
          <Card level={3} className="p-8 h-64 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Glass Level 3</h3>
              <p className="text-sm text-smash-text-secondary mt-1">Tooltips, floating menus. Sharp shadow, bright border.</p>
            </div>
            <Button variant="secondary" size="sm">Action</Button>
          </Card>
        </div>
      </section>

      {/* Core Task Mode System */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Mode Switcher</h2>
          <p className="text-smash-text-secondary">Global task capability selection.</p>
        </div>
        <ModeSwitcher activeMode={activeMode} onChange={setActiveMode} />
      </section>

      {/* Badges & Indicators */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Badges & Tags</h2>
          <p className="text-smash-text-secondary">Model capabilities and connection types.</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-smash-text-tertiary">Capabilities</h4>
            <div className="flex gap-2">
              <Badge variant="image">Image</Badge>
              <Badge variant="video">Video</Badge>
              <Badge variant="text">Text</Badge>
              <Badge variant="audio">Audio</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-smash-text-tertiary">Connections</h4>
            <div className="flex gap-2">
              <Badge variant="connection">API</Badge>
              <Badge variant="connection">Browser</Badge>
              <Badge variant="connection">Local</Badge>
              <Badge variant="connection">Open Source</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Status States */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Status Indicators</h2>
          <p className="text-smash-text-secondary">Live states for AI tasks.</p>
        </div>
        <Card level={2} className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {statusStates.map((state) => (
              <StatusIndicator key={state} state={state} />
            ))}
          </div>
        </Card>
      </section>

      {/* Button System */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Button System</h2>
          <p className="text-smash-text-secondary">Action hierarchy and states.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary"><Sparkles size={16} /> Generate All</Button>
          <Button variant="secondary">Run Selected</Button>
          <Button variant="tertiary">Cancel</Button>
          <Button variant="ghost">Save Draft</Button>
          <Button variant="danger">Stop Process</Button>
          <Button variant="success">Accept Result</Button>
          <Button variant="icon"><Settings size={18} /></Button>
          <Button variant="primary" isLoading>Processing</Button>
        </div>
      </section>

      {/* Input System */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Input System</h2>
          <p className="text-smash-text-secondary">Prompt composers and data entry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Input placeholder="Search models or tasks..." icon={<Search size={16} />} />
            <Input placeholder="Enter connection endpoint URL..." icon={<Terminal size={16} />} />
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Textarea placeholder="Compose your prompt here..." className="pb-12" />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="icon" size="sm" className="h-8 w-8"><Box size={14} /></Button>
                </div>
                <Button variant="primary" size="sm" className="h-8 rounded-md px-3"><Send size={14} /> Send</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Example: AI Card */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Component Assembly</h2>
          <p className="text-smash-text-secondary">Cards combining multiple design tokens.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card level={2} interactive className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary p-[1px]">
                  <div className="w-full h-full bg-smash-surface rounded-[7px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-smash-accent-violet" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Gemini 1.5 Pro</h4>
                  <p className="text-xs text-smash-text-secondary">Google AI</p>
                </div>
              </div>
              <Badge variant="connection">API</Badge>
            </div>
            
            <div className="flex gap-1">
              <Badge variant="text">Text</Badge>
              <Badge variant="image">Image</Badge>
              <Badge variant="video">Video</Badge>
            </div>
            
            <div className="pt-2 mt-auto border-t border-smash-border flex justify-between items-center">
              <StatusIndicator state="IDLE" label="Ready" />
              <Button variant="tertiary" size="sm" className="h-7 text-xs">Configure</Button>
            </div>
          </Card>

          <Card level={2} interactive className="p-5 flex flex-col gap-4 border-smash-accent-magenta/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-lg bg-smash-surface border border-smash-border flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-smash-text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Llama 3 Local</h4>
                  <p className="text-xs text-smash-text-secondary">Ollama Engine</p>
                </div>
              </div>
              <Badge variant="connection">LOCAL</Badge>
            </div>
            
            <div className="flex gap-1">
              <Badge variant="text">Text</Badge>
            </div>
            
            <div className="pt-2 mt-auto border-t border-smash-border flex justify-between items-center">
              <StatusIndicator state="GENERATING" label="Streaming..." />
              <Button variant="primary" size="sm" className="h-7 text-xs">Stop</Button>
            </div>
          </Card>
        </div>
      </section>
      
    </div>
  );
};
