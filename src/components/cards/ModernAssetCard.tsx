import React from 'react';
import { Menu } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { Motorbike01Icon, SpeedometerIcon, UserIcon, MoreHorizontalIcon, Delete01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons';
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
        case 'retired': return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-100', dot: 'bg-neutral-400' };
        default: return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-100', dot: 'bg-neutral-400' };
    }
};

const StatusBadge = ({ status }: { status: EnhancedAsset['healthStatus'] }) => {
    const colors = getStatusColor(status);
    return (
        <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
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
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${score}%` }} />
            </div>
            <span className="text-[10px] font-bold text-neutral-500 w-8 text-right">{score}%</span>
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
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 h-full flex flex-col group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 group-hover:scale-105 transition-transform">
                        <HugeiconsIcon icon={Motorbike01Icon} size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-neutral-900 leading-tight group-hover:text-primary-600 transition-colors uppercase">{asset.license_plate}</h3>
                        <p className="text-xs text-neutral-500 font-medium">{asset.model}</p>
                    </div>
                </div>
                <StatusBadge status={asset.healthStatus} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 flex-1">
                <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <HugeiconsIcon icon={SpeedometerIcon} size={12} className="text-neutral-400" />
                        <span className="text-[10px] uppercase font-bold text-neutral-400">Mileage</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700">{asset.mileage?.toLocaleString() || 0} km</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <HugeiconsIcon icon={UserIcon} size={12} className="text-neutral-400" />
                        <span className="text-[10px] uppercase font-bold text-neutral-400">Owner</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 truncate" title={asset.customer?.first_name}>{asset.customer?.first_name || 'N/A'}</p>
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-neutral-50 space-y-2">
                <HealthBar score={asset.healthScore} />

                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); onEdit?.(asset); }}
                        className="flex-1 py-1.5 px-3 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
                    >
                        Edit
                    </button>
                    <Menu>
                        <Menu.Target>
                            <button onClick={(e) => e.preventDefault()} className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 bg-white transition-colors">
                                <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                            </button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item color="red" leftSection={<HugeiconsIcon icon={Delete01Icon} size={16} />} onClick={() => onDelete?.(asset)}>
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
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 p-3 h-full flex flex-col group cursor-pointer relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", statusColors.dot)} />

            <div className="pl-3 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                            <HugeiconsIcon icon={Motorbike01Icon} size={16} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-neutral-900 leading-tight uppercase">{asset.license_plate}</h4>
                            <p className="text-[10px] text-neutral-500 font-medium">{asset.model}</p>
                        </div>
                    </div>

                    <Menu>
                        <Menu.Target>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-neutral-400 hover:text-primary-600 p-1">
                                <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                            </button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item onClick={(e) => { e.stopPropagation(); onEdit?.(asset); }}>Edit</Menu.Item>
                            <Menu.Item color="red" onClick={(e) => { e.stopPropagation(); onDelete?.(asset); }}>Delete</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-neutral-50 text-[10px]">
                    <div className="flex flex-col">
                        <span className="text-neutral-400 font-bold uppercase">Customer</span>
                        <span className="text-neutral-700 font-medium truncate">{asset.customer?.first_name || '-'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-neutral-400 font-bold uppercase">Location</span>
                        <span className="text-neutral-700 font-medium truncate">{asset.location?.name || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModernAssetCard = DetailedAssetCard;
