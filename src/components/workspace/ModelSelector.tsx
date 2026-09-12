import React, { useState, useMemo } from 'react';
import { Capability } from '../../contexts/AccountsContext';
import { useAccounts } from '../../contexts/AccountsContext';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Server, Globe, Terminal, Code, Link, Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ModelSelectorProps {
  activeMode: string;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ activeMode, selectedIds, onSelectToggle, onSelectAll }) => {
  const { getConnectionsByMode } = useAccounts();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter connections by active mode using context
  const compatibleConnections = getConnectionsByMode(activeMode).filter(c => c.enabled);
  
  const readyCount = compatibleConnections.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').length;
  const limitedCount = compatibleConnections.filter(c => c.status === 'LIMIT_REACHED').length;
  const offlineCount = compatibleConnections.filter(c => c.status === 'OFFLINE' || c.status === 'SESSION_EXPIRED' || c.status === 'API_ERROR').length;

  const filtered = compatibleConnections.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group by provider
  const grouped = filtered.reduce((acc, conn) => {
    if (!acc[conn.provider]) acc[conn.provider] = [];
    acc[conn.provider].push(conn);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const getIcon = (type: string) => {
    switch(type) {
      case 'API': return <Code size={14} />;
      case 'BROWSER': return <Globe size={14} />;
      case 'LOCAL': return <Server size={14} />;
      case 'OPEN_SOURCE': return <Terminal size={14} />;
      default: return <Link size={14} />;
    }
  };

  const allFilteredIds = filtered.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').map(c => c.id);
  const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  const handleProviderSelect = (provider: string) => {
    const providerIds = grouped[provider].filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').map(c => c.id);
    const allSelected = providerIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      onSelectAll(selectedIds.filter(id => !providerIds.includes(id)));
    } else {
      onSelectAll([...new Set([...selectedIds, ...providerIds])]);
    }
  };

  return (
    <div className="flex flex-col h-full glass-2 rounded-[32px] border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-white/[0.02]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-white">Compatible Models</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded-md">{compatibleConnections.length} Total</span>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-400/10 px-2 py-1 rounded-md hidden sm:block">{readyCount} Ready</span>
            {limitedCount > 0 && <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md hidden sm:block">{limitedCount} Limited</span>}
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input 
              icon={<Search size={14}/>} 
              placeholder="Search models..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button variant="secondary" size="sm" className="h-8 text-[10px] px-3 shrink-0" onClick={() => onSelectAll(areAllSelected ? [] : allFilteredIds)}>
              {areAllSelected ? 'DESELECT ALL' : 'SELECT ALL'}
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            {['ALL', 'API', 'BROWSER', 'LOCAL', 'OPEN_SOURCE'].map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
                  filterType === t ? "bg-white/10 text-white" : "text-smash-text-secondary hover:bg-white/5"
                )}
              >
                {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">No Models Found</span>
            <span className="text-xs">No active models support {activeMode} mode.</span>
          </div>
        ) : (
          Object.entries(grouped as Record<string, any[]>).map(([provider, conns]) => {
            const providerReadyIds = conns.filter(c => c.status === 'ACTIVE' || c.status === 'IN_USE').map(c => c.id);
            const providerAllSelected = providerReadyIds.length > 0 && providerReadyIds.every(id => selectedIds.includes(id));
            
            return (
              <div key={provider} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-smash-text-tertiary">{provider}</h4>
                  {providerReadyIds.length > 0 && (
                    <button onClick={() => handleProviderSelect(provider)} className="text-[9px] font-bold text-[#D946EF] hover:text-[#D946EF]/80 uppercase tracking-widest">
                      {providerAllSelected ? 'Deselect Provider' : 'Select Provider'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {conns.map(conn => {
                    const isSelected = selectedIds.includes(conn.id);
                    const isAvailable = conn.status === 'ACTIVE' || conn.status === 'IN_USE';

                    return (
                      <div 
                        key={conn.id}
                        onClick={() => isAvailable && onSelectToggle(conn.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex flex-col gap-2",
                          isAvailable ? "cursor-pointer hover:bg-white/5" : "opacity-50 cursor-not-allowed",
                          isSelected ? "glass-3 border-[#D946EF]/50 shadow-[0_0_15px_rgba(217,70,239,0.1)]" : "glass-3 border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected ? "bg-[#D946EF] border-[#D946EF]" : "border-smash-text-tertiary"
                            )}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{conn.name}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-smash-text-secondary flex items-center gap-1">
                                  {getIcon(conn.type)} {conn.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {!isAvailable && (
                          <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between">
                            <StatusIndicator state={conn.status as any} />
                            {conn.status === 'LIMIT_REACHED' && (
                              <span className="text-[9px] text-rose-400 font-bold">{conn.limitState ? 'Resetting soon' : 'Checking...'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
