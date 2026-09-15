import React from 'react';
import { useBrands } from '../../contexts/BrandsContext';

/** <option>s for every brand, keyed by name (the value GlobalUI's activeProject uses). */
export const BrandOptions: React.FC = () => {
  const { brands } = useBrands();
  if (!brands.length) return <option value="">No brands yet</option>;
  return (
    <>
      {brands.map((brand) => (
        <option key={brand.id} value={brand.name}>
          {brand.name}
        </option>
      ))}
    </>
  );
};
