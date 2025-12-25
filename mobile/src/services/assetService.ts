import {supabase} from './supabase';
import {Vehicle} from '@/types';

export interface AssetFilters {
  searchQuery?: string;
  make?: string;
  model?: string;
  year?: number;
  customerId?: string;
}

export interface AssetListResponse {
  data: Vehicle[];
  count: number;
  hasMore: boolean;
}

export class AssetService {
  /**
   * Get paginated list of assets (vehicles) with optional filtering
   */
  async getAssets(
    page: number = 1,
    limit: number = 20,
    filters: AssetFilters = {}
  ): Promise<AssetListResponse> {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          customers(name, phone, customer_type)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`
          make.ilike.%${filters.searchQuery}%,
          model.ilike.%${filters.searchQuery}%,
          license_plate.ilike.%${filters.searchQuery}%,
          vin.ilike.%${filters.searchQuery}%,
          customers.name.ilike.%${filters.searchQuery}%
        `);
      }

      if (filters.make) {
        query = query.eq('make', filters.make);
      }

      if (filters.model) {
        query = query.eq('model', filters.model);
      }

      if (filters.year) {
        query = query.eq('year', filters.year);
      }

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching assets:', error);
        throw new Error(`Failed to fetch assets: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit
      };
    } catch (error) {
      console.error('AssetService.getAssets error:', error);
      throw error;
    }
  }

  /**
   * Get asset details by ID with maintenance history
   */
  async getAssetById(assetId: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          customers(name, phone, customer_type)
        `)
        .eq('id', assetId)
        .single();

      if (error) {
        console.error('Error fetching asset details:', error);
        throw new Error(`Failed to fetch asset details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('AssetService.getAssetById error:', error);
      throw error;
    }
  }

  /**
   * Get maintenance history for an asset
   */
  async getAssetMaintenanceHistory(assetId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          workOrderNumber,
          status,
          priority,
          service,
          serviceNotes,
          initialDiagnosis,
          maintenanceNotes,
          completedAt,
          created_at,
          technicians(name)
        `)
        .eq('vehicleId', assetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance history:', error);
        throw new Error(`Failed to fetch maintenance history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('AssetService.getAssetMaintenanceHistory error:', error);
      throw error;
    }
  }

  /**
   * Search assets by QR code or VIN
   */
  async searchAssetByCode(code: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          customers(name, phone, customer_type)
        `)
        .or(`vin.eq.${code},id.eq.${code}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error searching asset by code:', error);
        throw new Error(`Failed to search asset: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('AssetService.searchAssetByCode error:', error);
      throw error;
    }
  }

  /**
   * Get unique makes for filtering
   */
  async getAssetMakes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('make')
        .not('make', 'is', null);

      if (error) {
        console.error('Error fetching asset makes:', error);
        throw new Error(`Failed to fetch asset makes: ${error.message}`);
      }

      // Get unique makes
      const uniqueMakes = [...new Set(data?.map(item => item.make).filter(Boolean))];
      return uniqueMakes.sort();
    } catch (error) {
      console.error('AssetService.getAssetMakes error:', error);
      throw error;
    }
  }

  /**
   * Get unique models for a specific make
   */
  async getAssetModels(make?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('vehicles')
        .select('model')
        .not('model', 'is', null);

      if (make) {
        query = query.eq('make', make);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching asset models:', error);
        throw new Error(`Failed to fetch asset models: ${error.message}`);
      }

      // Get unique models
      const uniqueModels = [...new Set(data?.map(item => item.model).filter(Boolean))];
      return uniqueModels.sort();
    } catch (error) {
      console.error('AssetService.getAssetModels error:', error);
      throw error;
    }
  }
}

export const assetService = new AssetService();