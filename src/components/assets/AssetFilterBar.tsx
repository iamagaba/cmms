import { Select } from '@/components/tailwind-components';
import { TableFiltersBar } from "@/components/TableFiltersBar";

interface AssetFilterBarProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    ownership: 'all' | 'company' | 'customer';
    setOwnership: (val: 'all' | 'company' | 'customer') => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    healthFilter: string;
    setHealthFilter: (val: string) => void;
    customerTypeFilter: 'All' | 'WATU' | 'Cash' | 'B2B';
    setCustomerTypeFilter: (val: 'All' | 'WATU' | 'Cash' | 'B2B') => void;
    handleClearFilters: () => void;
}

export const AssetFilterBar = ({
    searchTerm,
    setSearchTerm,
    ownership,
    setOwnership,
    statusFilter,
    setStatusFilter,
    healthFilter,
    setHealthFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    handleClearFilters
}: AssetFilterBarProps) => {

    const filterChips = [
        ...(searchTerm ? [{ label: `Search: ${searchTerm}`, onClose: () => setSearchTerm("") }] : []),
        ...(ownership !== 'all' ? [{ label: `Ownership: ${ownership}`, onClose: () => setOwnership('all') }] : []),
        ...(statusFilter !== 'all' ? [{ label: `Status: ${statusFilter}`, onClose: () => setStatusFilter('all') }] : []),
        ...(healthFilter !== 'all' ? [{ label: `Health: ${healthFilter}`, onClose: () => setHealthFilter('all') }] : []),
    ];

    return (
        <div className="bg-card/85 backdrop-blur-md backdrop-saturate-150 shadow-sm rounded-lg border border-border px-3 py-2 mb-3 sticky top-2 z-20">
            <TableFiltersBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterChips={filterChips}
                onClearAll={handleClearFilters}
                placeholder="Search..."
                className="bg-transparent border-none p-0 shadow-none"
            >
                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                    <div className="h-5 w-px bg-muted hidden sm:block mx-1"></div>

                    <Select
                        value={ownership}
                        onChange={(val) => setOwnership(val as any)}
                        data={[
                            { label: 'All Assets', value: 'all' },
                            { label: 'Company', value: 'company' },
                            { label: 'Customer', value: 'customer' },
                        ]}
                        className="w-full sm:w-[130px]"
                        size="xs"
                    />

                    <Select
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val || 'all')}
                        data={[
                            { label: 'Status: All', value: 'all' },
                            { label: 'Operational', value: 'operational' },
                            { label: 'Maintenance', value: 'maintenance' },
                            { label: 'Down', value: 'down' },
                            { label: 'Retired', value: 'retired' },
                        ]}
                        className="w-full sm:w-[130px]"
                        size="xs"
                    />

                    <Select
                        value={healthFilter}
                        onChange={(val) => setHealthFilter(val || 'all')}
                        data={[
                            { label: 'Health: All', value: 'all' },
                            { label: 'Excellent', value: 'excellent' },
                            { label: 'Good', value: 'good' },
                            { label: 'Fair', value: 'fair' },
                            { label: 'Poor', value: 'poor' },
                        ]}
                        className="w-full sm:w-[130px]"
                        size="xs"
                    />

                    {ownership !== 'company' && (
                        <Select
                            value={customerTypeFilter}
                            onChange={(v) => setCustomerTypeFilter(v as any)}
                            data={[
                                { label: 'Type: All', value: 'All' },
                                { label: 'WATU', value: 'WATU' },
                                { label: 'Cash', value: 'Cash' },
                                { label: 'B2B', value: 'B2B' },
                            ]}
                            className="w-full sm:w-[110px]"
                            size="xs"
                        />
                    )}
                </div>
            </TableFiltersBar>
        </div>
    );
};

