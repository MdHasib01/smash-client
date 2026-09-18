import React from 'react';
import { useBrands } from '../../contexts/BrandsContext';
import { SelectField } from '../ui/select-field';
import { cn } from '../../lib/utils';

/** shadcn Select over every brand, keyed by name (the value GlobalUI's activeProject uses). */
export const BrandSelect: React.FC<{ value: string; onValueChange: (name: string) => void; className?: string }> = ({
  value,
  onValueChange,
  className,
}) => {
  const { brands } = useBrands();
  return (
    <SelectField
      size="sm"
      aria-label="Brand"
      value={value}
      onValueChange={onValueChange}
      className={cn('min-w-[140px] bg-black/40 font-semibold', className)}
      options={
        brands.length
          ? brands.map((b) => ({
              value: b.name,
              label: (
                <>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                  {b.name}
                </>
              ),
            }))
          : [{ value: '', label: 'No brands yet' }]
      }
    />
  );
};
