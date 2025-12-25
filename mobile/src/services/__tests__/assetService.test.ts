import {assetService} from '../assetService';
import {supabase} from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('AssetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssets', () => {
    it('should fetch assets with pagination', async () => {
      const mockData = [
        {
          id: '1',
          make: 'Honda',
          model: 'CB125',
          year: 2023,
          license_plate: 'ABC123',
          vin: 'VIN123',
          customers: {
            name: 'John Doe',
            phone: '+1234567890',
          },
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.range.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      });

      const result = await assetService.getAssets(1, 20);

      expect(mockSupabase.from).toHaveBeenCalledWith('vehicles');
      expect(result).toEqual({
        data: mockData,
        count: 1,
        hasMore: false,
      });
    });

    it('should handle search filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.or.mockReturnThis();
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await assetService.getAssets(1, 20, {searchQuery: 'Honda'});

      expect(mockQuery.or).toHaveBeenCalledWith(
        expect.stringContaining('make.ilike.%Honda%')
      );
    });
  });

  describe('getAssetById', () => {
    it('should fetch asset details by ID', async () => {
      const mockAsset = {
        id: '1',
        make: 'Honda',
        model: 'CB125',
        year: 2023,
        license_plate: 'ABC123',
        vin: 'VIN123',
        customers: {
          name: 'John Doe',
          phone: '+1234567890',
        },
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAsset,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await assetService.getAssetById('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('vehicles');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockAsset);
    });
  });

  describe('searchAssetByCode', () => {
    it('should search asset by VIN or ID', async () => {
      const mockAsset = {
        id: '1',
        make: 'Honda',
        model: 'CB125',
        year: 2023,
        license_plate: 'ABC123',
        vin: 'VIN123',
        customers: {
          name: 'John Doe',
          phone: '+1234567890',
        },
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockAsset,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await assetService.searchAssetByCode('VIN123');

      expect(mockSupabase.from).toHaveBeenCalledWith('vehicles');
      expect(mockQuery.or).toHaveBeenCalledWith('vin.eq.VIN123,id.eq.VIN123');
      expect(result).toEqual(mockAsset);
    });

    it('should return null when asset not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: {code: 'PGRST116'},
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await assetService.searchAssetByCode('NOTFOUND');

      expect(result).toBeNull();
    });
  });
});