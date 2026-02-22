import {
    Clock,
    CheckCircle,
    Pause,
    AlertCircle,
    ChevronUp,
    Menu,
    ChevronDown,
    ClipboardCheck
} from 'lucide-react';

// Enhanced status and priority configurations
export const STATUS_CONFIG = {
    'New': { color: 'slate', icon: Clock, label: 'New' },
    'Confirmation': { color: 'blue', icon: Clock, label: 'Confirmation' },
    'In Progress': { color: 'orange', icon: Clock, label: 'In Progress' },
    'Ready': { color: 'indigo', icon: ClipboardCheck, label: 'Ready' },
    'Completed': { color: 'green', icon: CheckCircle, label: 'Completed' },
    'On Hold': { color: 'yellow', icon: Pause, label: 'On Hold' },
    'Cancelled': { color: 'red', icon: AlertCircle, label: 'Cancelled' },
} as const;

export const PRIORITY_CONFIG = {
    'High': { color: 'red', icon: ChevronUp, label: 'High Priority' },
    'Medium': { color: 'yellow', icon: Menu, label: 'Medium Priority' },
    'Low': { color: 'green', icon: ChevronDown, label: 'Low Priority' },
} as const;
