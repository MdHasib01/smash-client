import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConnectionCard } from '../components/accounts/ConnectionCard';
import { AccountInspector } from '../components/accounts/AccountInspector';
import { AddConnectionModal } from '../components/accounts/AddConnectionModal';
import { AgentToolsPanel } from '../components/accounts/AgentToolsPanel';
import { useToast } from '../contexts/ToastContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useAccounts, SmashConnection } from '../contexts/AccountsContext';
import { Plus, RefreshCcw, Activity, Search, LayoutGrid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';

export const AccountsCenter: React.FC = () => {
  const { setInspectorContent, setInspectorTitle, setInspectorOpen } = useGlobalUI();
  const { connections: allConnections, reload, testConnection, isLoading } = useAccounts();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const connections = query
    ? allConnections.filter((c) =>
        [c.name, c.provider, c.model].some((field) => String(field ?? '').toLowerCase().includes(query))
      )
    : allConnections;

  const handleTestAll = async () => {
    setIsTesting(true);
    const enabled = allConnections.filter((c) => c.enabled);
    const results = await Promise.allSettled(enabled.map((c) => testConnection(c.id)));
    const reachable = results.filter((r) => r.status === 'fulfilled' && r.value?.reachable).length;
    addToast(`Checked ${enabled.length} connection(s)`, 'INFO', `${reachable} reachable`);
    setIsTesting(false);
  };

  // Derived Stats
  const total = connections.length;
  const active = connections.filter(c => c.status === 'ACTIVE').length;
  const limited = connections.filter(c => c.status === 'LIMIT_REACHED').length;
  const offline = connections.filter(c => c.status === 'OFFLINE' || c.status === 'SESSION_EXPIRED').length;
  const errors = connections.filter(c => c.status === 'API_ERROR').length;

  const handleSelectConnection = (conn: SmashConnection) => {
    setInspectorTitle('Connection Details');
    setInspectorContent(<AccountInspector connection={conn} />); 
    setInspectorOpen(true);
  };

  // Grouping connections by provider for Grid View
  const groupedConnections = connections.reduce((acc, conn) => {
    if (!acc[conn.provider]) acc[conn.provider] = [];
    acc[conn.provider].push(conn);
    return acc;
  }, {} as Record<string, SmashConnection[]>);

  return (
    <PageContainer 
      title="Accounts & Models"
      description="Connect and manage every AI source from one place."
      primaryAction={
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} /> ADD CONNECTION
        </Button>
      }
      secondaryToolbar={
        <div className="flex w-full flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleTestAll} isLoading={isTesting}><Activity size={14}/> Test Connections</Button>
            <Button variant="ghost" size="sm" onClick={() => reload()} disabled={isLoading}><RefreshCcw size={14}/> Refresh All</Button>
          </div>
          <div className="flex items-center gap-4">
            <Input 
              icon={<Search size={14}/>} 
              placeholder="Search connections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 md:w-64 h-9"
            />
            {/* Grid is the only view today; the list option is a placeholder. */}
            <ToggleGroup type="single" value="grid" spacing={1} className="rounded-lg p-1 border border-white/10 bg-white/[0.04]">
              <ToggleGroupItem value="grid" size="sm" aria-label="Grid view" className="w-8 h-7 min-w-0 rounded-md"><LayoutGrid size={14}/></ToggleGroupItem>
              <ToggleGroupItem value="list" size="sm" aria-label="List view" className="w-8 h-7 min-w-0 rounded-md text-smash-text-secondary"><List size={14}/></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-10 pb-20">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card level={3} className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">Total Connections</span>
            <span className="text-3xl font-mono font-bold text-white">{total}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-violet-500">
            <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">Active</span>
            <span className="text-3xl font-mono font-bold text-violet-400">{active}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-rose-500">
            <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">Limited</span>
            <span className="text-3xl font-mono font-bold text-rose-400">{limited}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-smash-text-secondary">
            <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">Offline</span>
            <span className="text-3xl font-mono font-bold text-smash-text-secondary">{offline}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-red-500">
            <span className="text-[10px] font-bold tracking-widest uppercase text-smash-text-tertiary">Errors</span>
            <span className="text-3xl font-mono font-bold text-red-400">{errors}</span>
          </Card>
        </div>

        {/* Connections, with the read-only Agent Tools panel alongside */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-10">
          {Object.entries(groupedConnections as Record<string, SmashConnection[]>).map(([provider, providerConns]) => (
            <div key={provider} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold tracking-widest uppercase text-white">{provider}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[10px] font-bold text-smash-text-secondary">{(providerConns as SmashConnection[]).length} Connections</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {(providerConns as SmashConnection[]).map(conn => (
                  <ConnectionCard 
                    key={conn.id} 
                    connection={conn} 
                    onSelect={handleSelectConnection} 
                  />
                ))}
              </div>
            </div>
          ))}
          {!connections.length && (
            <p className="text-sm text-smash-text-tertiary">{query ? 'No connections match your search.' : 'No connections yet.'}</p>
          )}
        </div>

        <aside className="w-full xl:w-80 shrink-0 xl:sticky xl:top-4">
          <AgentToolsPanel />
        </aside>
        </div>

      </div>

      <AddConnectionModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
    </PageContainer>
  );
};
