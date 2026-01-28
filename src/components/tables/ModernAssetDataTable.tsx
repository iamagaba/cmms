import { ArrowLeft, Bike, Calendar, ClipboardList, Eye, MoreVertical, Trash2, ChevronRight, Edit } from 'lucide-react';
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


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
                    <div className="w-7 h-7 rounded bg-primary/5 text-primary flex items-center justify-center border border-primary/20">
                        <Bike className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-mono font-medium tracking-tight text-sm text-primary">{info.getValue()}</div>
                        <div className="text-xs text-muted-foreground">{info.row.original.make} {info.row.original.model}</div>
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
                        <span className="text-sm font-medium text-gray-900">{name}</span>
                        <span className="text-xs text-gray-500">Owner</span>
                    </div>
                );
            }
        }),
        columnHelper.accessor('location', {
            header: 'Location',
            cell: info => (
                <div className="flex items-center gap-1.5 text-gray-700">
                    <Location01Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{info.getValue()?.name || 'Unassigned'}</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const status = info.getValue() as string;
                const statusColors: Record<string, string> = {
                    'Normal': 'bg-emerald-50 text-emerald-700 border-emerald-300',
                    'In Repair': 'bg-amber-50 text-amber-700 border-amber-300',
                    'Decommissioned': 'bg-destructive/10 text-destructive border-destructive/30',
                };
                return (
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wide border ${statusColors[status] || 'bg-muted text-muted-foreground border-border'}`}>
                        {status || 'Normal'}
                    </span>
                );
            },
        }),
        columnHelper.accessor('created_at', {
            header: 'Asset Age',
            cell: info => {
                const createdAt = info.getValue();
                if (!createdAt) return <span className="text-sm text-muted-foreground">-</span>;

                const now = new Date();
                const created = new Date(createdAt);
                const diffTime = Math.abs(now.getTime() - created.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let ageText = '';
                if (diffDays < 30) {
                    ageText = `${diffDays}d`;
                } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30);
                    ageText = `${months}mo`;
                } else {
                    const years = Math.floor(diffDays / 365);
                    ageText = `${years}yr`;
                }

                return (
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="font-mono text-xs text-foreground">{ageText}</span>
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
                        <ClipboardList className="w-4 h-4 text-gray-400" />
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
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(isOpen ? null : info.row.original.id);
                                }}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                type="button"
                            >
                                <MoreVertical className="w-4 h-4" />
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
                                        <Edit className="w-4 h-4" />
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
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                    <div className="border-t border-gray-200 my-1" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(info.row.original);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        }),
    ], [onEdit, onDelete, onViewDetails, openMenuId, workOrders]);

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
                        <div className="h-8 w-8 bg-muted rounded-md" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3" />
                            <div className="h-3 bg-muted/50 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                className="cursor-pointer"
                                onClick={() => onViewDetails(row.original.id)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="px-3 py-2 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> of <span className="font-semibold text-foreground">{assets.length}</span> assets
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};




