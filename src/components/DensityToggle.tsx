import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  LayoutDistributeVerticalIcon,
  LayoutDistributeHorizontalIcon
} from '@hugeicons/core-free-icons';
import { useDensity } from '@/context/DensityContext';

export const DensityToggle: React.FC = () => {
  const { densityMode, setDensityMode } = useDensity();

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => setDensityMode('cozy')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          densityMode === 'cozy'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title="Cozy mode - More spacing and larger elements"
      >
        <HugeiconsIcon icon={LayoutDistributeVerticalIcon} size={16} />
        <span>Cozy</span>
      </button>
      <button
        onClick={() => setDensityMode('compact')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          densityMode === 'compact'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        title="Compact mode - More information on screen"
      >
        <HugeiconsIcon icon={LayoutDistributeHorizontalIcon} size={16} />
        <span>Compact</span>
      </button>
    </div>
  );
};
