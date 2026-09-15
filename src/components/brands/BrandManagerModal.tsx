import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Check, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useBrands } from '../../contexts/BrandsContext';
import { useToast } from '../../contexts/ToastContext';
import { Brand } from '../../types/api';
import { cn } from '../../lib/utils';

const SWATCHES = ['#D946EF', '#8B5CF6', '#F43F5E', '#06B6D4', '#10B981', '#F59E0B'];

interface BrandManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandManagerModal: React.FC<BrandManagerModalProps> = ({ isOpen, onClose }) => {
  const { brands, createBrand, updateBrand, deleteBrand } = useBrands();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

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
    if (!window.confirm(`Delete "${brand.name}"? Personas and assets in this brand will lose their home.`)) return;
    try {
      await deleteBrand(brand.id);
      addToast(`Brand "${brand.name}" deleted`, 'SUCCESS');
    } catch (err) {
      addToast((err as Error).message, 'ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md max-h-[85vh] flex flex-col glass-1 border border-white/10 rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden"
      >
        <div className="p-6 pb-4 border-b border-white/5 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Brands</h2>
            <p className="text-xs text-smash-text-secondary mt-0.5">
              Every persona, asset and result belongs to a brand.
            </p>
          </div>
          <Button variant="icon" onClick={onClose} className="w-8 h-8 glass-3 text-smash-text-secondary hover:text-white">
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
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

                <button
                  title="Rename"
                  onClick={() => {
                    setEditingId(brand.id);
                    setEditingName(brand.name);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-smash-text-tertiary hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                  <Pencil size={13} />
                </button>
                <button
                  title="Delete"
                  onClick={() => handleDelete(brand)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-smash-text-tertiary hover:text-rose-300 hover:bg-white/5 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {!brands.length && (
              <p className="text-xs text-smash-text-tertiary text-center py-4">
                No brands yet. Add your first one below.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">
              New brand
            </span>

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
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-transform',
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
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
