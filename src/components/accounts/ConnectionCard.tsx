import React from 'react';
import { SmashConnection } from '../../contexts/AccountsContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';
import { MoreHorizontal, Play, Power, ExternalLink, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ConnectionCardProps {
  connection: SmashConnection;
  onSelect: (conn: SmashConnection) => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onSelect }) => {
  
  const getProviderIcon = (provider: string) => {
    switch(provider.toUpperCase()) {
      case 'OPENAI': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'GOOGLE': return 'bg-[#D946EF]/20 text-[#D946EF] border-[#D946EF]/30';
      case 'ANTHROPIC': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'OLLAMA': return 'bg-white/10 text-white border-white/20';
      default: return 'bg-[#7C3AED]/20 text-[#D946EF] border-[#D946EF]/30';
    }
  };

  const formatResetTime = (limitState?: string) => {
    return limitState || 'Unavailable';
  };

  return (
    <Card 
      level={2} 
      interactive 
      onClick={() => onSelect(connection)}
      className={cn(
        "p-5 flex flex-col gap-4 relative group",
        !connection.enabled && "opacity-50 grayscale",
        connection.status === 'API_ERROR' && "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        connection.status === 'LIMIT_REACHED' && "border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs", getProviderIcon(connection.provider))}>
            {connection.provider.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-white text-sm">{connection.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="connection">{connection.type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <StatusIndicator state={connection.status as any} />
        </div>
      </div>
      
      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {connection.capabilities.map(cap => (
          <Badge key={cap} variant={cap.toLowerCase() as any}>{cap}</Badge>
        ))}
      </div>

      {/* Dynamic Content Area */}
      <div className="min-h-[40px] flex flex-col justify-center">
        {connection.status === 'LIMIT_REACHED' ? (
          <div className="rounded-lg p-2.5 border border-rose-500/20 bg-rose-500/5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-rose-400 mb-1">Quota Exceeded</div>
            <div className="text-xs font-medium text-white">{formatResetTime(connection.limitState)}</div>
          </div>
        ) : connection.status === 'SESSION_EXPIRED' ? (
          <div className="rounded-lg p-2.5 border border-red-500/20 bg-red-500/5">
             <div className="text-[10px] font-bold tracking-widest uppercase text-red-400 mb-1">Authentication Required</div>
             <div className="text-xs text-smash-text-secondary">Browser session cookies expired.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-end justify-between">
              <div className="text-[9px] font-bold uppercase tracking-widest text-smash-text-tertiary">
                Connection Health
              </div>
              <div className="text-lg font-mono font-bold text-white leading-none">
                {connection.health}%
              </div>
            </div>
            <Progress value={Number(connection.health) || 0} className="h-1.5" />
          </div>
        )}
      </div>
      
      {/* Actions Footer */}
      <div className="pt-3 mt-auto border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-2">
          {connection.type === 'BROWSER' ? (
            <Button variant="secondary" size="sm" className="text-[10px] tracking-wider" onClick={(e) => { e.stopPropagation(); }}>
              <ExternalLink size={12} /> OPEN SESSION
            </Button>
          ) : (
            <Button variant="tertiary" size="sm" className="text-[10px] tracking-wider" onClick={(e) => { e.stopPropagation(); }}>
              <Settings2 size={12} /> CONFIGURE
            </Button>
          )}
        </div>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="icon" size="icon-sm" className="text-smash-text-tertiary hover:text-white" aria-label="Power" onClick={(e) => { e.stopPropagation(); }}>
                <Power size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Power</TooltipContent>
          </Tooltip>
          <Button variant="icon" size="icon-sm" className="text-smash-text-tertiary hover:text-white" aria-label="More" onClick={(e) => { e.stopPropagation(); }}>
            <MoreHorizontal size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
