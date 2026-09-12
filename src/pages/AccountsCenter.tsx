import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConnectionCard } from '../components/accounts/ConnectionCard';
import { AccountInspector } from '../components/accounts/AccountInspector';
import { AddConnectionModal } from '../components/accounts/AddConnectionModal';
import { ConnectionModel } from '../types/accounts';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { useAccounts, SmashConnection } from '../contexts/AccountsContext';
import { Plus, RefreshCcw, Activity, Search, LayoutGrid, List } from 'lucide-react';

export const AccountsCenter: React.FC = () => {
  const { setInspectorContent, setInspectorTitle, setInspectorOpen } = useGlobalUI();
  const { connections } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

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
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"><Activity size={14} className="mr-2"/> Test Connections</Button>
            <Button variant="ghost" size="sm"><RefreshCcw size={14} className="mr-2"/> Refresh All</Button>
          </div>
          <div className="flex items-center gap-4">
            <Input 
              icon={<Search size={14}/>} 
              placeholder="Search connections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 bg-glass-3"
            />
            <div className="glass-3 rounded-lg flex p-1 border border-white/10">
              <button className="w-8 h-7 rounded-md bg-white/10 text-white flex items-center justify-center"><LayoutGrid size={14}/></button>
              <button className="w-8 h-7 rounded-md text-smash-text-secondary hover:text-white flex items-center justify-center"><List size={14}/></button>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-10 pb-20">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card level={3} className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Total Connections</span>
            <span className="text-3xl font-mono font-bold text-white">{total}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-violet-500">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Active</span>
            <span className="text-3xl font-mono font-bold text-violet-400">{active}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-rose-500">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Limited</span>
            <span className="text-3xl font-mono font-bold text-rose-400">{limited}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-smash-text-secondary">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Offline</span>
            <span className="text-3xl font-mono font-bold text-smash-text-secondary">{offline}</span>
          </Card>
          <Card level={3} className="p-4 flex flex-col gap-1 border-b-2 border-red-500">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">Errors</span>
            <span className="text-3xl font-mono font-bold text-red-400">{errors}</span>
          </Card>
        </div>

        {/* Grouped Grid View */}
        <div className="flex flex-col gap-10">
          {Object.entries(groupedConnections as Record<string, SmashConnection[]>).map(([provider, providerConns]) => (
            <div key={provider} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black tracking-widest uppercase text-white">{provider}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[10px] font-bold text-smash-text-secondary">{(providerConns as SmashConnection[]).length} Connections</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>

      </div>

      <AddConnectionModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
    </PageContainer>
  );
};
