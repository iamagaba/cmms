import React, { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { Vehicle } from '@/types/supabase';
import { Icon } from '@iconify/react';
import { useDensity } from '@/context/DensityContext';

// Define the shape of our data (EnhancedAsset effectively)
export interface AssetTableItem extends Vehicle {
    location?: any;
    customer?: any;
    healthStatus?: 'operational' | 'maintenance' | 'down' | 'retired';
    healthScore?: number;
    mileage?: number;
}

interface ModernAssetDataTableProps {
    assets: AssetTableItem[];
    customers: any[];
    locations: any[];
    workOrders: any[];
    onEdit: (asset: AssetTableItem) => void;
    onDelete: (asset: AssetTableItem) => void;
    onViewDetails: (assetId: string) => void;
    loading?: boolean;
}

const columnHelper = createColumnHelper<AssetTableItem>();

export const ModernAssetDataTable = ({
    assets,
    workOrders,
    onEdit,
    onDelete,
    onViewDetails,
    loading
}: ModernAssetDataTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const { isCompact } = useDensity();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (openMenuId) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);
    const columns = useMemo(() => [
        columnHelper.accessor('license_plate', {
            header: 'Asset',
            cell: info => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                        <Icon icon="tabler:motorbike" className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-900">{info.getValue()}</div>
                        <div className="text-[10px] text-gray-500">{info.row.original.make} {info.row.original.model}</div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('customer', {
            header: 'Customer',
            cell: info => {
                const customer = info.getValue();
                const name = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '-';
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900">{name}</span>
                        <span className="text-[10px] text-gray-500">Owner</span>
                    </div>
                );
            }
        }),
        columnHelper.accessor('location', {
            header: 'Location',
            cell: info => (
                <div className="flex items-center gap-1.5 text-gray-700">
                    <Icon icon="tabler:map-pin" className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium">{info.getValue()?.name || 'Unassigned'}</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const status = info.getValue() as string;
                const statusColors: Record<string, string> = {
                    'Normal': 'bg-green-100 text-green-800 border-green-200',
                    'Available': 'bg-green-100 text-green-800 border-green-200',
                    'In Repair': 'bg-amber-100 text-amber-800 border-amber-200',
                    'Decommissioned': 'bg-red-100 text-red-800 border-red-200',
                };
                return (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {status || 'Normal'}
                    </span>
                );
            },
        }),
        columnHelper.accessor('created_at', {
            header: 'Asset Age',
            cell: info => {
                const createdAt = info.getValue();
                if (!createdAt) return <span className="text-xs text-gray-500">-</span>;
                
                const now = new Date();
                const created = new Date(createdAt);
                const diffTime = Math.abs(now.getTime() - created.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let ageText = '';
                if (diffDays < 30) {
                    ageText = `${diffDays} days`;
                } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30);
                    ageText = `${months} month${months > 1 ? 's' : ''}`;
                } else {
                    const years = Math.floor(diffDays / 365);
                    ageText = `${years} year${years > 1 ? 's' : ''}`;
                }
                
                return (
                    <div className="flex items-center gap-1.5">
                        <Icon icon="tabler:calendar" className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-700">{ageText}</span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'workOrders',
            header: 'Work Orders',
            cell: info => {
                const vehicleId = info.row.original.id;
                const workOrderCount = workOrders?.filter(wo => wo.vehicle_id === vehicleId || wo.vehicleId === vehicleId).length || 0;
                return (
                    <div className="flex items-center gap-1.5">
                        <Icon icon="tabler:clipboard-list" className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">{workOrderCount}</span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: info => {
                const isOpen = openMenuId === info.row.original.id;
                return (
                    <div className="flex justify-end gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewDetails(info.row.original.id); }}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="View Details"
                        >
                            <Icon icon="tabler:eye" className="w-4 h-4" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setOpenMenuId(isOpen ? null : info.row.original.id);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                type="button"
                            >
                                <Icon icon="tabler:dots-vertical" className="w-4 h-4" />
                            </button>
                            {isOpen && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onEdit(info.row.original);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Icon icon="tabler:edit" className="w-4 h-4" />
                                        Edit Asset
                                    </button>
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onViewDetails(info.row.original.id);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Icon icon="tabler:eye" className="w-4 h-4" />
                                        View Details
                                    </button>
                                    <div className="border-t border-gray-200 my-1" />
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onDelete(info.row.original);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Icon icon="tabler:trash" className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        }),
    ], [onEdit, onDelete, onViewDetails, openMenuId, workOrders, isCompact]);

    const table = useReactTable({
        data: assets,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) {
        return (
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="h-8 w-8 bg-slate-100 rounded-md" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                            <div className="h-3 bg-slate-50 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-3 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => onViewDetails(row.original.id)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls - Compact */}
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{table.getRowModel().rows.length}</span> of <span className="font-semibold text-gray-900">{assets.length}</span> assets
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Icon icon="tabler:chevron-left" className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Icon icon="tabler:chevron-right" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};