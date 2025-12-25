import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSession } from '@/context/SessionContext';
import { Location } from '@/types/supabase';

interface TVLayoutProps {
    children: React.ReactNode;
    lastUpdated: Date;
    selectedLocation: string;
    locations: Location[];
    onLocationChange: (id: string) => void;
}

export const TVLayout = ({ children, lastUpdated, selectedLocation, locations, onLocationChange }: TVLayoutProps) => {
    const { session } = useSession();
    const [time, setTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Toggle Dark Mode Class
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        // Full viewport centering wrapper
        <div className={`min-h-screen w-full flex items-center justify-center bg-gray-950 overflow-hidden`}>

            {/* 16:9 Aspect Ratio Container */}
            <div className="aspect-video w-full max-w-[1920px] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white relative shadow-2xl overflow-hidden font-sans selection:bg-primary-500 selection:text-white transition-colors duration-300">

                {/* Header */}
                <header className="h-20 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-8 shadow-sm z-10 relative transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center shadow-primary-900/20 dark:shadow-primary-900/50 shadow-lg">
                            <Icon icon="heroicons:wrench-screwdriver" className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white/90 font-display">MAINTENANCE COMMAND</h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-widest uppercase">
                                {session?.user.email || 'SYSTEM ACTIVE'}
                            </p>
                        </div>
                    </div>

                    {/* Center Time */}
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-black tracking-widest font-mono text-primary-600 dark:text-primary-400">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
                            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                        >
                            <Icon icon={isDarkMode ? "heroicons:sun" : "heroicons:moon"} className="w-6 h-6" />
                        </button>

                        <select
                            value={selectedLocation}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-lg rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                        >
                            <option value="all">All Service Centers</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                                LIVE UPDATE
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-600">
                                Last: {lastUpdated.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="h-[calc(100%-5rem)] p-6 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
};
