'use client';

import React, { useState, createContext, useContext } from 'react';
import { MobileSideMenu } from '@/components/MobileSideMenu';

interface MenuContextType {
  openMenu: () => void;
  closeMenu: () => void;
  isMenuOpen: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const contextValue: MenuContextType = {
    openMenu,
    closeMenu,
    isMenuOpen,
  };

  return (
    <MenuContext.Provider value={contextValue}>
      <MobileSideMenu isOpen={isMenuOpen} onClose={closeMenu} />
      <div className="pb-16 safe-area">{children}</div>
    </MenuContext.Provider>
  );
}