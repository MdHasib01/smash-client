import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useBrands } from '../../contexts/BrandsContext';
import { useToast } from '../../contexts/ToastContext';
import { Brand } from '../../types/api';
import { cn } from '../../lib/utils';
import { useConfirm } from '../../contexts/ConfirmContext';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';

const SWATCHES = ['#D946EF', '#8B5CF6', '#F43F5E', '#06B6D4', '#10B981', '#F59E0B'];

interface BrandManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandManagerModal: React.FC<BrandManagerModalProps> = ({ isOpen, onClose }) => {
  const { brands, createBrand, updateBrand, deleteBrand } = useBrands();
  const { addToast } = useToast();
  const confirm = useConfirm();

  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await createBrand({ name: trimmed, color });
      addToast(`Brand "${trimmed}" created`, 'SUCCESS');
      setName('');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRename = async (brand: Brand) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === brand.name) {
      setEditingId(null);
      return;
    }
    try {
      await updateBrand(brand.id, { name: trimmed });
      addToast('Brand renamed', 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!(await confirm({ title: 'Delete brand?', description: `Delete "${brand.name}"? Personas and assets in this brand will lose their home.` }))) return;
    try {
      await deleteBrand(brand.id);
      addToast(`Brand "${brand.name}" deleted`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 overflow-hidden sm:max-w-md max-h-[85vh] rounded-3xl"
      >
        <div className="p-6 pb-4 border-b border-white/5 flex items-start justify-between shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-white tracking-tight">Brands</DialogTitle>
            <DialogDescription className="text-xs text-smash-text-secondary mt-0.5">
              Every persona, asset and result belongs to a brand.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="icon" size="icon-sm" aria-label="Close">
              <X size={16} />
            </Button>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: brand.color }}
                >
                  {brand.name.charAt(0).toUpperCase()}
                </div>

                {editingId === brand.id ? (
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(brand)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(brand);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="h-8 text-xs flex-1"
                  />
                ) : (
                  <span className="flex-1 text-sm font-bold text-white truncate">{brand.name}</span>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Rename"
                      onClick={() => {
                        setEditingId(brand.id);
                        setEditingName(brand.name);
                      }}
                      className="text-smash-text-tertiary"
                    >
                      <Pencil size={13} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete"
                      onClick={() => handleDelete(brand)}
                      className="text-smash-text-tertiary hover:text-rose-300"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            ))}

            {!brands.length && (
              <p className="text-xs text-smash-text-tertiary text-center py-4">
                No brands yet. Add your first one below.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <Label className="text-[10px] font-bold tracking-widest uppercase text-smash-text-secondary">
              New brand
            </Label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Milkimom"
            />

            <div className="flex items-center gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  aria-label={`Color ${swatch}`}
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    color === swatch ? 'scale-110 ring-2 ring-white/40' : 'hover:scale-105'
                  )}
                >
                  {color === swatch && <Check size={13} className="text-white" />}
                </button>
              ))}

              <Button
                variant="primary"
                size="sm"
                className="ml-auto"
                isLoading={isSaving}
                disabled={!name.trim()}
                onClick={handleCreate}
              >
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
