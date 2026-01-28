import { Bike, User, Trash2 } from 'lucide-react';
import React from 'react';
import { Menu } from '@/components/tailwind-components';


import { Vehicle } from '@/types/supabase';
import { cn } from '@/lib/utils';

export interface EnhancedAsset extends Vehicle {
    location?: any;
    customer?: any;
    workOrderCount: number;
    lastMaintenanceDate?: string;
    healthScore: number;
    healthStatus: 'operational' | 'maintenance' | 'down' | 'retired';
    ageInYears: number;
    utilizationRate: number;
    maintenanceCost: number;
    nextMaintenanceDue?: string;
    criticalIssues: number;
}

const getStatusColor = (status: EnhancedAsset['healthStatus']) => {
    switch (status) {
        case 'operational': return { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-100', dot: 'bg-success-500' };
        case 'maintenance': return { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-100', dot: 'bg-warning-500' };
        case 'down': return { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-100', dot: 'bg-error-500' };
        case 'retired': return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', dot: 'bg-muted-foreground' };
        default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', dot: 'bg-muted-foreground' };
    }
};

const StatusBadge = ({ status }: { status: EnhancedAsset['healthStatus'] }) => {
    const colors = getStatusColor(status);
    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
            colors.bg,
            colors.text,
            colors.border
        )}>
            {status === 'down' ? 'Out of Service' : status}
        </span>
    );
};

const HealthBar = ({ score }: { score: number }) => {
    const color = score > 80 ? 'bg-success-500' : score > 50 ? 'bg-warning-500' : 'bg-error-500';
    return (
        <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-bold text-muted-foreground w-8 text-right">{score}%</span>
        </div>
    );
};

export const DetailedAssetCard = ({ asset, onEdit, onDelete, onViewDetails }: {
    asset: EnhancedAsset;
    onEdit?: (asset: EnhancedAsset) => void;
    onDelete?: (asset: EnhancedAsset) => void;
    onViewDetails?: (assetId: string) => void;
}) => {
    return (
        <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 h-full flex flex-col group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                        <Bike className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors uppercase">{asset.license_plate}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{asset.model}</p>
                    </div>
                </div>
                <StatusBadge status={asset.healthStatus} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 flex-1">
                <div className="bg-muted rounded-lg p-2 border">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <SpeedometerIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase font-bold text-muted-foreground">Mileage</span>
                    </div>
                    <span className="text-sm font-semibold font-inconsolata">{(asset.mileage || 0).toLocaleString()} km</span>
                </div>
                <div className="bg-muted rounded-lg p-2 border">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase font-bold text-muted-foreground">Owner</span>
                    </div>
                    <p className="text-xs font-bold truncate" title={asset.customer?.first_name}>{asset.customer?.first_name || 'N/A'}</p>
                </div>
            </div>

            <div className="mt-auto pt-3 border-t space-y-2">
                <HealthBar score={asset.healthScore} />

                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); onEdit?.(asset); }}
                        className="flex-1 py-1.5 px-3 bg-card border text-muted-foreground rounded-lg text-xs font-bold hover:bg-muted hover:border-border transition-colors"
                    >
                        Edit
                    </button>
                    <Menu>
                        <Menu.Target>
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 flex items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground hover:border-border bg-card transition-colors">
                                <MoreHorizontalIcon className="w-4 h-4" />
                            </button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item color="red" leftSection={<Trash2 className="w-4 h-4" />} onClick={() => onDelete?.(asset)}>
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>
        </div>
    );
};

export const CompactAssetCard = ({ asset, onEdit, onDelete }: {
    asset: EnhancedAsset;
    onEdit?: (asset: EnhancedAsset) => void;
    onDelete?: (asset: EnhancedAsset) => void;
    onViewDetails?: (assetId: string) => void;
}) => {
    const statusColors = getStatusColor(asset.healthStatus);

    return (
        <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 p-3 h-full flex flex-col group cursor-pointer relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", statusColors.dot)} />

            <div className="pl-3 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <Bike className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold leading-tight uppercase">{asset.license_plate}</h4>
                            <p className="text-xs text-muted-foreground font-medium">{asset.model}</p>
                        </div>
                    </div>

                    <Menu>
                        <Menu.Target>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-muted-foreground hover:text-primary p-1">
                                <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item onClick={(e) => { e.stopPropagation(); onEdit?.(asset); }}>Edit</Menu.Item>
                            <Menu.Item color="red" onClick={(e) => { e.stopPropagation(); onDelete?.(asset); }}>Delete</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground font-bold uppercase">Customer</span>
                        <span className="font-medium truncate">{asset.customer?.first_name || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground font-bold uppercase">Location</span>
                        <span className="font-medium truncate">{asset.location?.name || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModernAssetCard = DetailedAssetCard;




