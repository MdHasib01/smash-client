import React, { useState } from 'react';
import { useAccounts, SmashConnection } from '../../contexts/AccountsContext';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Server, Globe, Terminal, Code, Link, Search, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useAgentTools } from '../../hooks/useAgentTools';
import { AgentTarget } from '../../types/api';
import { Checkbox } from '../ui/checkbox';
import { SelectField } from '../ui/select-field';
import { Label } from '../ui/label';
import { Badge } from '../ui/Badge';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface ModelSelectorProps {
  activeMode: string;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  /** Per-run CLI/model for node-agent connections, keyed by connection id. */
  agentTargets: Record<string, AgentTarget>;
  onAgentTargetChange: (connectionId: string, target: AgentTarget) => void;
}

const isReady = (c: SmashConnection) => c.status === 'ACTIVE' || c.status === 'IN_USE';
const isNodeAgent = (c: SmashConnection) => c.adapter === 'NODE_AGENT';

const selectClass = 'bg-black/40 px-2 text-xs';

const getIcon = (type: string) => {
  switch (type) {
    case 'API':
      return <Code size={14} />;
    case 'BROWSER':
      return <Globe size={14} />;
    case 'LOCAL':
      return <Server size={14} />;
    case 'OPEN_SOURCE':
      return <Terminal size={14} />;
    default:
      return <Link size={14} />;
  }
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  activeMode,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  agentTargets,
  onAgentTargetChange,
}) => {
  const { getConnectionsByMode } = useAccounts();
  const { tools, isLoading: toolsLoading, reload: reloadTools } = useAgentTools();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const compatibleConnections = getConnectionsByMode(activeMode).filter((c) => c.enabled);

  const readyCount = compatibleConnections.filter(isReady).length;
  const limitedCount = compatibleConnections.filter((c) => c.status === 'LIMIT_REACHED').length;

  const filtered = compatibleConnections.filter((c) => {
    const needle = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(needle) || c.provider.toLowerCase().includes(needle);
    const matchesType = filterType === 'ALL' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  // Node agents are pinned above everything else; the rest group by provider.
  const agentConnections = filtered.filter(isNodeAgent);
  const grouped: Record<string, SmashConnection[]> = filtered
    .filter((c) => !isNodeAgent(c))
    .reduce<Record<string, SmashConnection[]>>((acc, conn) => {
      (acc[conn.provider] ??= []).push(conn);
      return acc;
    }, {});

  const allFilteredIds = filtered.filter(isReady).map((c) => c.id);
  const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

  // What node-agent says this token may use.
  const agentClis = tools?.agents?.length ? tools.agents : (tools?.clis ?? []).map((cli) => ({ cli, label: cli }));
  const defaultCli = tools?.defaults?.cli ?? agentClis[0]?.cli;

  /** "codex:gpt-5.6-sol" -> ['codex', 'gpt-5.6-sol']; the model may itself contain ':'. */
  const splitConnModel = (conn: SmashConnection) => {
    const raw = String(conn.model ?? '').trim();
    const at = raw.indexOf(':');
    return at === -1 ? [raw, ''] : [raw.slice(0, at), raw.slice(at + 1)];
  };

  /**
   * A model only belongs to its own CLI (mirrors the server's resolveAgentTarget):
   * the connection's model for the connection's CLI, the server default for the
   * default CLI, otherwise the CLI's own default.
   */
  const defaultModelFor = (conn: SmashConnection, cli: string) => {
    const [connCli, connModel] = splitConnModel(conn);
    if (cli === connCli && connModel) return connModel;
    if (cli === tools?.defaults?.cli && tools?.defaults?.model) return tools.defaults.model;
    return 'default';
  };

  /** The choice shown for a connection: this run's pick, else its configured CLI, else the agent default. */
  const targetFor = (conn: SmashConnection): Required<AgentTarget> => {
    const [connCli] = splitConnModel(conn);
    const picked = agentTargets[conn.id] ?? {};
    const cliKnown = (cli?: string) => cli && agentClis.some((a) => a.cli === cli);
    const cli = (cliKnown(picked.cli) && picked.cli) || (cliKnown(connCli) && connCli) || defaultCli || '';
    return { cli, model: (picked.cli === cli && picked.model) || defaultModelFor(conn, cli) };
  };

  const toggle = (conn: SmashConnection) => {
    if (!isReady(conn)) return;
    // Pin down exactly what is shown, so the run uses what the user sees. Not
    // before the agent list has loaded - that would pin an empty choice.
    if (isNodeAgent(conn) && agentClis.length && !selectedIds.includes(conn.id) && !agentTargets[conn.id]) {
      onAgentTargetChange(conn.id, targetFor(conn));
    }
    onSelectToggle(conn.id);
  };

  const handleProviderSelect = (provider: string) => {
    const providerIds = grouped[provider].filter(isReady).map((c) => c.id);
    const allSelected = providerIds.every((id) => selectedIds.includes(id));
    onSelectAll(
      allSelected ? selectedIds.filter((id) => !providerIds.includes(id)) : [...new Set([...selectedIds, ...providerIds])]
    );
  };

  // Display-only: the whole row is the click target.
  const renderCheckbox = (selected: boolean) => (
    <Checkbox checked={selected} tabIndex={-1} aria-hidden className="pointer-events-none border-smash-text-tertiary" />
  );

  const renderAgentCard = (conn: SmashConnection) => {
    const isSelected = selectedIds.includes(conn.id);
    const available = isReady(conn);
    const target = targetFor(conn);
    const agent = agentClis.find((a) => a.cli === target.cli) as
      | { cli: string; label: string; available?: boolean | null; auth?: string }
      | undefined;
    const models = tools?.models?.[target.cli] ?? [];
    // Reachable but no agents usually means node-agent refused us (e.g. no token);
    // show its reason instead of empty dropdowns.
    const agentDown =
      tools && (!tools.configured || !tools.reachable || (!agentClis.length && Boolean(tools.message)));

    return (
      <div
        key={conn.id}
        className={cn(
          'p-3 rounded-xl border transition-all flex flex-col gap-3',
          isSelected
            ? 'bg-[#D946EF]/[0.06] border-[#D946EF]/50 shadow-[0_0_15px_rgba(217,70,239,0.1)]'
            : 'bg-white/[0.03] border-white/10',
          !available && 'opacity-60'
        )}
      >
        <div
          onClick={() => toggle(conn)}
          className={cn('flex items-center gap-3', available ? 'cursor-pointer' : 'cursor-not-allowed')}
        >
          {renderCheckbox(isSelected)}
          <div className="w-8 h-8 rounded-lg bg-[#D946EF]/15 text-[#D946EF] flex items-center justify-center shrink-0">
            <Bot size={15} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{tools?.name ?? conn.name}</span>
            <span className="text-[10px] text-smash-text-secondary truncate">
              {agent ? `${agent.label} · ${target.model}` : 'Local CLI agent'}
            </span>
          </div>
        </div>

        {agentDown ? (
          <div className="flex items-start gap-2 text-[11px] text-amber-300/90">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            <span className="flex-1">{tools?.message ?? 'Node agent is unreachable.'}</span>
            <button
              onClick={() => reloadTools(true)}
              className="text-smash-text-tertiary hover:text-white shrink-0"
              title="Check again"
            >
              <RefreshCw size={12} className={cn(toolsLoading && 'animate-spin')} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">Agent</Label>
              <SelectField
                size="sm"
                aria-label="Agent"
                className={selectClass}
                value={target.cli}
                disabled={!agentClis.length}
                onValueChange={(v) =>
                  // A different CLI has a different model catalogue - reset to its default.
                  onAgentTargetChange(conn.id, { cli: v, model: defaultModelFor(conn, v) })
                }
                options={[
                  ...(!agentClis.length ? [{ value: '', label: toolsLoading ? 'Loading…' : 'None allowed' }] : []),
                  ...agentClis.map((a: any) => ({
                    value: a.cli,
                    label: `${a.label}${a.auth === 'unauthenticated' ? ' (signed out)' : a.available === false ? ' (not installed)' : ''}`,
                  })),
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">Model</Label>
              <SelectField
                size="sm"
                aria-label="Model"
                className={selectClass}
                value={target.model}
                disabled={!target.cli}
                onValueChange={(v) => onAgentTargetChange(conn.id, { cli: target.cli, model: v })}
                options={[
                  // Keep "default" and any saved choice selectable even if the catalogue lacks it.
                  ...(!models.some((m) => m.id === 'default') ? [{ value: 'default', label: 'Default' }] : []),
                  ...(target.model !== 'default' && !models.some((m) => m.id === target.model)
                    ? [{ value: target.model, label: target.model }]
                    : []),
                  ...models.map((m) => ({ value: m.id, label: m.label || m.id })),
                ]}
              />
            </div>
          </div>
        )}

        {agent?.auth === 'unauthenticated' && !agentDown && (
          <p className="text-[10px] text-amber-300/80">
            {agent.label} is signed out on the agent machine — this run will fail until it signs in again.
          </p>
        )}

        {!available && (
          <div className="pt-2 border-t border-white/5">
            <StatusIndicator state={conn.status as any} />
          </div>
        )}
      </div>
    );
  };

  const renderConnection = (conn: SmashConnection) => {
    const isSelected = selectedIds.includes(conn.id);
    const available = isReady(conn);
    return (
      <div
        key={conn.id}
        onClick={() => toggle(conn)}
        className={cn(
          'p-3 rounded-xl border transition-all flex flex-col gap-2',
          available ? 'cursor-pointer hover:bg-white/5' : 'opacity-50 cursor-not-allowed',
          isSelected ? 'bg-[#D946EF]/[0.06] border-[#D946EF]/50 shadow-[0_0_15px_rgba(217,70,239,0.1)]' : 'glass-3 border-transparent'
        )}
      >
        <div className="flex items-center gap-3">
          {renderCheckbox(isSelected)}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{conn.name}</span>
            <span className="text-[10px] text-smash-text-secondary flex items-center gap-1 mt-0.5">
              {getIcon(conn.type)} {conn.type}
              {conn.model ? <span className="text-smash-text-tertiary">· {conn.model}</span> : null}
            </span>
          </div>
        </div>

        {!available && (
          <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between">
            <StatusIndicator state={conn.status as any} />
            {conn.status === 'LIMIT_REACHED' && (
              <span className="text-[9px] text-rose-400 font-bold">{conn.limitState ? 'Resetting soon' : 'Checking...'}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const nothing = !agentConnections.length && Object.keys(grouped).length === 0;

  return (
    <div className="flex flex-col h-full w-full glass-2 rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-white/[0.02]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-tight text-white">Compatible Models</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              {compatibleConnections.length} Total
            </Badge>
            <Badge variant="status" statusColor="connected" className="px-2 py-1 hidden sm:inline-flex">
              {readyCount} Ready
            </Badge>
            {limitedCount > 0 && (
              <Badge variant="status" statusColor="generating" className="px-2 py-1 hidden sm:inline-flex">
                {limitedCount} Limited
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              icon={<Search size={14} />}
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] tracking-wider shrink-0"
              onClick={() => onSelectAll(areAllSelected ? [] : allFilteredIds)}
            >
              {areAllSelected ? 'DESELECT ALL' : 'SELECT ALL'}
            </Button>
          </div>
          <ToggleGroup
            type="single"
            spacing={1}
            value={filterType}
            onValueChange={(v) => v && setFilterType(v)}
            className="w-full justify-start overflow-x-auto no-scrollbar pb-1"
          >
            {['ALL', 'API', 'BROWSER', 'LOCAL', 'OPEN_SOURCE', 'CUSTOM'].map((t) => (
              <ToggleGroupItem
                key={t}
                value={t}
                size="sm"
                className="h-6 min-w-0 px-2.5 rounded-md text-[9px] font-bold uppercase tracking-widest whitespace-nowrap text-smash-text-secondary"
              >
                {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {nothing ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">No Models Found</span>
            <span className="text-xs">No active models support {activeMode} mode.</span>
          </div>
        ) : (
          <>
            {agentConnections.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#D946EF]">Node Agent</h4>
                  <span className="text-[9px] font-bold text-smash-text-tertiary uppercase tracking-widest">
                    {agentClis.length} agent{agentClis.length === 1 ? '' : 's'} allowed
                  </span>
                </div>
                <div className="flex flex-col gap-2">{agentConnections.map(renderAgentCard)}</div>
              </div>
            )}

            {Object.entries(grouped).map(([provider, conns]) => {
              const providerReadyIds = conns.filter(isReady).map((c) => c.id);
              const providerAllSelected =
                providerReadyIds.length > 0 && providerReadyIds.every((id) => selectedIds.includes(id));

              return (
                <div key={provider} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">{provider}</h4>
                    {providerReadyIds.length > 0 && (
                      <button
                        onClick={() => handleProviderSelect(provider)}
                        className="text-[9px] font-bold text-[#D946EF] hover:text-[#D946EF]/80 uppercase tracking-widest"
                      >
                        {providerAllSelected ? 'Deselect Provider' : 'Select Provider'}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">{conns.map(renderConnection)}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
