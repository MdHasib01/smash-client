import React from 'react';
import { motion } from 'motion/react';
import { Terminal, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { useAgentTools } from '../../hooks/useAgentTools';
import { cn } from '../../lib/utils';

/**
 * Read-only view of the local node agent.
 *
 * Everything about it — URL, token, default CLI — lives in the server's .env by
 * design, so this panel deliberately exposes only the name and live status.
 */
export const AgentToolsPanel: React.FC = () => {
  const { tools, isLoading, error, reload: load } = useAgentTools();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-2 border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-smash-text-secondary shrink-0">
            <Terminal size={15} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-smash-text-tertiary">Agent Tools</h3>
            <p className="text-sm font-bold text-white leading-tight">{tools?.name ?? 'Node Agent'}</p>
          </div>
        </div>

        <Button
          variant="icon"
          size="icon-sm"
          className="shrink-0"
          title="Re-check the agent"
          aria-label="Re-check the agent"
          onClick={() => load(true)}
          disabled={isLoading}
        >
          <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {tools && (
        <>
          <div className="flex items-center gap-2">
            <StatusIndicator
              state={tools.reachable ? 'ACTIVE' : tools.configured ? 'OFFLINE' : 'DISABLED'}
              label={
                tools.reachable
                  ? `Reachable${tools.latencyMs != null ? ` · ${tools.latencyMs}ms` : ''}`
                  : tools.configured
                    ? 'Unreachable'
                    : 'Not configured'
              }
            />
          </div>

          {!tools.reachable && tools.message && (
            <p className="text-[11px] text-smash-text-secondary leading-relaxed">{tools.message}</p>
          )}

          {tools.reachable && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">
                  Available CLIs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tools.clis.map((cli) => (
                    <Badge key={cli} variant={cli === tools.defaults.cli ? 'connection' : 'outline'}>
                      {cli}
                      {tools.models[cli]?.length ? ` · ${tools.models[cli].length}` : ''}
                    </Badge>
                  ))}
                  {!tools.clis.length && (
                    <span className="text-[11px] text-smash-text-tertiary">None reported</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-smash-text-tertiary">Default CLI</span>
                  <span className="text-white font-bold">{tools.defaults.cli ?? '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-smash-text-tertiary">Default model</span>
                  <span className="text-white font-bold">{tools.defaults.model ?? '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-smash-text-tertiary">Prompt refining</span>
                  <span className="text-white font-bold">{tools.refinePrompts ? 'On' : 'Off'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-smash-text-tertiary">Token</span>
                  <span className="text-white font-bold">{tools.hasToken ? 'Set' : 'None'}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5 pt-3 border-t border-white/5 text-[10px] text-smash-text-tertiary">
            <Lock size={10} className="shrink-0" />
            <span>Configured in the server .env — not editable here.</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
