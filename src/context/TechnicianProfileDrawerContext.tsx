
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TechnicianProfileDrawerContextType {
  isDrawerOpen: boolean;
  technicianId: string | null;
  showTechnician: (id: string) => void;
  closeDrawer: () => void;
}

const TechnicianProfileDrawerContext = createContext<TechnicianProfileDrawerContextType | undefined>(undefined);

export const TechnicianProfileDrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState<string | null>(null);

  const showTechnician = (id: string) => {
    setTechnicianId(id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTechnicianId(null);
  };

  return (
    <TechnicianProfileDrawerContext.Provider value={{ isDrawerOpen, technicianId, showTechnician, closeDrawer }}>
      {children}
    </TechnicianProfileDrawerContext.Provider>
  );
};

export const useTechnicianProfileDrawer = () => {
  const context = useContext(TechnicianProfileDrawerContext);
  if (context === undefined) {
    throw new Error('useTechnicianProfileDrawer must be used within a TechnicianProfileDrawerProvider');
  }
  return context;
};
