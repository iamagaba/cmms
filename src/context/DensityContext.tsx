import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DensityMode = 'cozy' | 'compact';

interface DensityContextType {
  densityMode: DensityMode;
  setDensityMode: (mode: DensityMode) => void;
  isCompact: boolean;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export const DensityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [densityMode, setDensityModeState] = useState<DensityMode>(() => {
    const saved = localStorage.getItem('density-mode');
    return (saved === 'cozy' || saved === 'compact') ? saved : 'cozy';
  });

  useEffect(() => {
    localStorage.setItem('density-mode', densityMode);
    // Add a data attribute to the document for CSS-based styling
    document.documentElement.setAttribute('data-density', densityMode);
  }, [densityMode]);

  const setDensityMode = (mode: DensityMode) => {
    setDensityModeState(mode);
  };

  const isCompact = densityMode === 'compact';

  return (
    <DensityContext.Provider value={{ densityMode, setDensityMode, isCompact }}>
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = (): DensityContextType => {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
};
