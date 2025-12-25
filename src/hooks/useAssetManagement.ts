import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, Customer, Location, WorkOrder } from '@/types/supabase';
import { EnhancedAsset } from '@/components/cards/ModernAssetCard';
import { showSuccess, showError } from '@/utils/toast';
import { camelToSnakeCase, snakeToCamelCase } from '@/utils/data-helpers';
import dayjs from 'dayjs';

export interface AssetMetrics {
    total: number;
    operational: number;
    inMaintenance: number;
    decommissioned: number;
    withWorkOrders: number;
    totalMaintenanceCost: number;
    criticalIssues: number;
}

export const useAssetManagement = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [ageFilter, setAgeFilter] = useState<string>('all');
    const [modelFilter, setModelFilter] = useState<string>('all');
    const [productionDateFilter, setProductionDateFilter] = useState<string>('all');
    const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
    const [customerTypeFilter, setCustomerTypeFilter] = useState<'All' | 'WATU' | 'Cash' | 'B2B'>('All');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [healthFilter, setHealthFilter] = useState<string>('all');

    // --- Data Fetching ---
    const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
        queryKey: ['vehicles', searchTerm],
        queryFn: async () => {
            let query = supabase.from('vehicles').select('*');
            if (searchTerm) {
                query = query.or(`license_plate.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`);
            }
            const { data, error } = await query.order('license_plate');
            if (error) throw new Error(error.message);
            return (data || []) as Vehicle[];
        }
    });

    const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data, error } = await supabase.from('customers').select('*');
            if (error) throw new Error(error.message);
            return (data || []).map(customer => snakeToCamelCase(customer) as Customer);
        }
    });

    const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('locations').select('*');
            if (error) throw new Error(error.message);
            return (data || []) as Location[];
        }
    });

    const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
        queryKey: ['work-orders'],
        queryFn: async () => {
            const { data, error } = await supabase.from('work_orders').select('*');
            if (error) throw new Error(error.message);
            return (data || []).map(wo => snakeToCamelCase(wo) as WorkOrder);
        }
    });

    // --- Mutations ---
    const vehicleMutation = useMutation({
        mutationFn: async (vehicleData: Partial<Vehicle>) => {
            console.log('=== ASSET SAVE DEBUG ===');
            console.log('Original vehicleData:', vehicleData);

            const payload = camelToSnakeCase(vehicleData);
            console.log('Converted payload:', payload);

            if (!vehicleData.id) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (payload as any).id;
                console.log('Final payload for insert:', payload);

                const { data, error } = await supabase.from('vehicles').insert([payload]).select();
                console.log('Insert response - data:', data);
                console.log('Insert response - error:', error);

                if (error) {
                    console.error('Database error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    throw new Error(`Database error: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
                }
                return data;
            } else {
                console.log('Updating existing vehicle with ID:', vehicleData.id);
                const { data, error } = await supabase.from('vehicles').update(payload).eq('id', vehicleData.id).select();
                console.log('Update response - data:', data);
                console.log('Update response - error:', error);

                if (error) {
                    console.error('Database error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    throw new Error(`Database error: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
                }
                return data;
            }
        },
        onSuccess: () => {
            console.log('Asset save successful, invalidating all vehicle queries');
            // Invalidate all vehicle queries regardless of search term
            queryClient.invalidateQueries({ queryKey: ['vehicles'], exact: false });
            showSuccess('Asset has been saved.');
        },
        onError: (error) => {
            console.error('Asset save failed:', error);
            showError(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('vehicles').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            showSuccess('Asset has been deleted.');
        },
        onError: (error) => showError(error.message),
    });

    // --- Data Transformation & Calculations ---
    const enhancedAssets: EnhancedAsset[] = useMemo(() => {
        if (!vehicles || !customers || !locations || !workOrders) return [];

        const locationMap = new Map(locations.map(l => [l.id, l]));
        const customerMap = new Map(customers.map(c => [c.id, c]));

        return vehicles.map(asset => {
            // Calculate work order metrics
            const assetWorkOrders = workOrders.filter(wo =>
                wo.vehicleId === asset.id || (wo as any).vehicle_id === asset.id
            );
            const workOrderCount = assetWorkOrders.length;

            // Calculate last maintenance date
            const maintenanceOrders = assetWorkOrders
                .filter(wo => wo.status === 'Completed' &&
                    (wo.service?.toLowerCase().includes('maintenance') ||
                        wo.description?.toLowerCase().includes('maintenance')))
                .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix());

            const lastMaintenanceDate = maintenanceOrders[0]?.created_at;

            // Calculate age
            const ageInYears = asset.purchaseDate ?
                dayjs().diff(dayjs(asset.purchaseDate), 'year', true) : 0;

            // Calculate health score based on various factors
            let healthScore = 100;

            // Age factor (max 30 points deduction)
            healthScore -= Math.min(ageInYears * 3, 30);

            // Work order frequency factor (max 25 points deduction)
            const workOrderFrequency = workOrderCount / Math.max(ageInYears, 1);
            healthScore -= Math.min(workOrderFrequency * 5, 25);

            // Maintenance recency factor (max 25 points deduction)
            if (lastMaintenanceDate) {
                const daysSinceLastMaintenance = dayjs().diff(dayjs(lastMaintenanceDate), 'day');
                if (daysSinceLastMaintenance > 365) {
                    healthScore -= 25;
                } else if (daysSinceLastMaintenance > 180) {
                    healthScore -= 15;
                } else if (daysSinceLastMaintenance > 90) {
                    healthScore -= 5;
                }
            } else if (ageInYears > 1) {
                healthScore -= 20;
            }

            // Mileage factor for vehicles (max 20 points deduction)
            if (asset.mileage && asset.mileage > 100000) {
                healthScore -= Math.min((asset.mileage - 100000) / 10000 * 2, 20);
            }

            healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

            // Determine status
            let healthStatus: EnhancedAsset['healthStatus'] = 'operational';
            if (asset.status === 'Decommissioned') {
                healthStatus = 'retired';
            } else if (healthScore < 30) {
                healthStatus = 'down';
            } else if (healthScore < 60) {
                healthStatus = 'maintenance';
            }

            // Calculate utilization rate (simplified)
            const utilizationRate = Math.min(100, Math.max(0,
                100 - (workOrderCount * 2) - (ageInYears * 5)
            ));

            // Calculate maintenance cost
            const maintenanceCost = assetWorkOrders.reduce((sum, wo) => {
                return sum + ((wo as any).estimated_cost || 0);
            }, 0);

            // Calculate next maintenance due
            const nextMaintenanceDue = lastMaintenanceDate
                ? dayjs(lastMaintenanceDate).add(6, 'month').toISOString()
                : asset.purchaseDate
                    ? dayjs(asset.purchaseDate).add(6, 'month').toISOString()
                    : undefined;

            // Count critical issues
            let criticalIssues = 0;
            if (nextMaintenanceDue && dayjs(nextMaintenanceDue).isBefore(dayjs())) {
                criticalIssues += 1;
            }
            if (workOrderCount > 20) {
                criticalIssues += 1;
            }
            if (healthScore < 30) {
                criticalIssues += 1;
            }

            return {
                ...asset,
                location: asset.locationId ? locationMap.get(asset.locationId) : undefined,
                customer: asset.customerId ? customerMap.get(asset.customerId) : undefined,
                workOrderCount,
                lastMaintenanceDate,
                healthScore,
                healthStatus,
                ageInYears: Math.round(ageInYears * 10) / 10,
                utilizationRate: Math.round(utilizationRate),
                maintenanceCost,
                nextMaintenanceDue,
                criticalIssues,
            };
        });
    }, [vehicles, customers, locations, workOrders]);

    // --- Filtering ---
    const filteredVehicles = useMemo(() => {
        let filtered = enhancedAssets;

        // Apply age filter
        if (ageFilter !== 'all') {
            filtered = filtered.filter(asset => {
                const age = asset.ageInYears;
                switch (ageFilter) {
                    case 'new': return age <= 1;
                    case 'recent': return age > 1 && age <= 3;
                    case 'mature': return age > 3 && age <= 7;
                    case 'old': return age > 7;
                    default: return true;
                }
            });
        }

        // Apply model filter
        if (modelFilter !== 'all') {
            filtered = filtered.filter(asset => asset.model === modelFilter);
        }

        // Apply production date filter
        if (productionDateFilter !== 'all') {
            filtered = filtered.filter(asset => {
                if (!asset.purchaseDate) return false;
                const year = dayjs(asset.purchaseDate).year();
                const currentYear = dayjs().year();

                switch (productionDateFilter) {
                    case 'current': return year === currentYear;
                    case 'last-year': return year === currentYear - 1;
                    case 'last-3-years': return year >= currentYear - 3;
                    case 'older': return year < currentYear - 3;
                    default: return true;
                }
            });
        }

        // Apply emergency filter
        if (emergencyOnly) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered = filtered.filter(asset => (asset as any).is_emergency_bike === true);
        }

        // Apply customer type filter
        if (customerTypeFilter !== 'All') {
            const allowedCustomerIds = new Set(
                customers?.filter(c => {
                    const type = c.customer_type ?? c.customerType ?? 'WATU';
                    return type === customerTypeFilter;
                }).map(c => c.id) || []
            );
            filtered = filtered.filter(asset =>
                asset.customerId && allowedCustomerIds.has(asset.customerId)
            );
        }

        // Apply asset status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(asset => asset.status === statusFilter);
        }

        // Apply work orders filter
        if (healthFilter !== 'all') {
            filtered = filtered.filter(asset => {
                switch (healthFilter) {
                    case 'has-orders': return asset.workOrderCount > 0;
                    case 'no-orders': return asset.workOrderCount === 0;
                    default: return true;
                }
            });
        }

        return filtered;
    }, [enhancedAssets, ageFilter, modelFilter, productionDateFilter, emergencyOnly, customerTypeFilter, statusFilter, healthFilter, customers]);

    // --- Metrics ---
    const metrics: AssetMetrics = useMemo(() => {
        const total = enhancedAssets.length; // Use all assets for total, not filtered
        const operational = enhancedAssets.filter(a => a.status === 'Normal' || a.status === 'Available').length;
        const inMaintenance = enhancedAssets.filter(a => a.status === 'In Repair').length;
        const decommissioned = enhancedAssets.filter(a => a.status === 'Decommissioned').length;
        const withWorkOrders = enhancedAssets.filter(a => a.workOrderCount > 0).length;
        const totalMaintenanceCost = enhancedAssets.reduce((sum, a) => sum + a.maintenanceCost, 0);
        const criticalIssues = enhancedAssets.filter(a => a.status === 'In Repair' && a.workOrderCount > 2).length;

        return {
            total,
            operational,
            inMaintenance,
            decommissioned,
            withWorkOrders,
            totalMaintenanceCost,
            criticalIssues,
        };
    }, [enhancedAssets]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setAgeFilter('all');
        setModelFilter('all');
        setProductionDateFilter('all');
        setStatusFilter('all');
        setHealthFilter('all');
        setEmergencyOnly(false);
        setCustomerTypeFilter('All');
    };

    const isLoading = isLoadingVehicles || isLoadingCustomers || isLoadingLocations || isLoadingWorkOrders;

    // Get unique models for filter options
    const availableModels = useMemo(() => {
        const models = new Set(enhancedAssets.map(asset => asset.model).filter(Boolean));
        return Array.from(models).sort();
    }, [enhancedAssets]);

    return {
        // State
        searchTerm, setSearchTerm,
        ageFilter, setAgeFilter,
        modelFilter, setModelFilter,
        productionDateFilter, setProductionDateFilter,
        emergencyOnly, setEmergencyOnly,
        customerTypeFilter, setCustomerTypeFilter,
        statusFilter, setStatusFilter,
        healthFilter, setHealthFilter,

        // Data
        vehicles: filteredVehicles,
        allVehicles: enhancedAssets,
        customers,
        locations,
        workOrders,
        metrics,
        availableModels,
        isLoading,

        // Actions
        handleClearFilters,
        saveAsset: vehicleMutation.mutateAsync,
        deleteAsset: deleteMutation.mutateAsync,
    };
};
