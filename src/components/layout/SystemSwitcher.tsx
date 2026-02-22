/**
 * System Switcher Component
 *
 * A premium workspace/system switcher component similar to Linear/Vercel.
 * Displays the current active system and allows switching via a dropdown menu.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Headphones, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveSystem } from '@/context/ActiveSystemContext';
import { ActiveSystem } from '@/types/ticketing';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemOption {
    id: ActiveSystem;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
}

const systems: SystemOption[] = [
    {
        id: 'cmms',
        label: 'Fleet CMMS',
        sublabel: 'Maintenance',
        icon: Wrench,
        color: 'bg-blue-600'
    },
    {
        id: 'ticketing',
        label: 'Customer Care',
        sublabel: 'Ticketing',
        icon: Headphones,
        color: 'bg-emerald-600'
    },
];

interface SystemSwitcherProps {
    isCollapsed?: boolean;
}

export const SystemSwitcher: React.FC<SystemSwitcherProps> = ({ isCollapsed = false }) => {
    const { activeSystem, setActiveSystem, canSwitchSystem } = useActiveSystem();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const currentSystem = systems.find(s => s.id === activeSystem) || systems[0];
    const SystemIcon = currentSystem.icon;

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (systemId: ActiveSystem) => {
        setActiveSystem(systemId);
        setIsOpen(false);
        navigate('/');
    };

    // If user cannot switch, just render the static header view
    if (!canSwitchSystem) {
        return (
            <div className={cn(
                "flex items-center gap-3 px-2 py-2 mx-2 mt-2 rounded-md transition-all duration-200",
                isCollapsed ? "justify-center px-0 mx-0" : "hover:bg-accent/50"
            )}>
                <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md shadow-sm text-primary-foreground flex-shrink-0",
                    currentSystem.color
                )}>
                    <SystemIcon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{currentSystem.label}</span>
                        <span className="text-xs text-muted-foreground truncate">{currentSystem.sublabel}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative px-2 pt-2" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 border border-transparent",
                    isOpen ? "bg-secondary-foreground/20 border-white/10 shadow-none" : "hover:bg-secondary-foreground/10 hover:border-white/5",
                    isCollapsed && "justify-center px-0 py-2 border-none bg-transparent hover:bg-transparent"
                )}
            >
                <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md shadow-sm text-white flex-shrink-0 transition-all duration-200",
                    currentSystem.color,
                    isCollapsed && "w-10 h-10 rounded-xl" // Slightly larger when collapsed for better touch target
                )}>
                    <SystemIcon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                    <>
                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                            <span className="text-sm font-semibold text-secondary-foreground truncate leading-none mb-0.5">
                                {currentSystem.label}
                            </span>
                            <span className="text-xs text-secondary-foreground/70 truncate leading-none">
                                {currentSystem.sublabel}
                            </span>
                        </div>
                        <ChevronsUpDown className="w-4 h-4 text-secondary-foreground/50 flex-shrink-0" />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && !isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-2 right-2 top-full mt-1.5 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <div className="p-1 space-y-0.5">
                            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Switch System
                            </div>

                            {systems.map((system) => {
                                const Icon = system.icon;
                                const isActive = activeSystem === system.id;
                                return (
                                    <button
                                        key={system.id}
                                        onClick={() => handleSelect(system.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-left",
                                            isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "text-foreground hover:bg-accent/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center w-6 h-6 rounded-md",
                                            isActive ? "bg-background shadow-sm" : "bg-muted"
                                        )}>
                                            <Icon className={cn("w-3.5 h-3.5", system.color.replace('bg-', 'text-'))} />
                                        </div>
                                        <div className="flex-1 flex flex-col items-start min-w-0 text-left">
                                            <span className="text-sm font-medium text-foreground truncate leading-none mb-0.5">{system.label}</span>
                                            <span className="text-xs text-muted-foreground truncate leading-none">{system.sublabel}</span>
                                        </div>
                                        {isActive && <Check className={cn("w-4 h-4", system.color.replace('bg-', 'text-'))} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};
