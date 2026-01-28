import React from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StorageLocationFieldsProps {
  warehouse: string | null;
  zone: string | null;
  aisle: string | null;
  bin: string | null;
  shelf: string | null;
  onChange: (field: string, value: string | null) => void;
}

export const StorageLocationFields: React.FC<StorageLocationFieldsProps> = ({
  warehouse,
  zone,
  aisle,
  bin,
  shelf,
  onChange,
}) => {


  const handleChange = (field: string, value: string) => {
    onChange(field, value.trim() || null);
  };

  return (
    <div className="space-y-4">
      {/* Warehouse and Zone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warehouse" className="text-xs font-medium mb-1.5">
            Warehouse
          </Label>
          <Input
            id="warehouse"
            type="text"
            value={warehouse || ''}
            onChange={(e) => handleChange('warehouse', e.target.value)}
            placeholder="e.g., Main"
          />
        </div>
        <div>
          <Label htmlFor="zone" className="text-xs font-medium mb-1.5">
            Zone
          </Label>
          <Input
            id="zone"
            type="text"
            value={zone || ''}
            onChange={(e) => handleChange('zone', e.target.value)}
            placeholder="e.g., A"
          />
        </div>
      </div>

      {/* Aisle, Bin, Shelf */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="aisle" className="text-xs font-medium mb-1.5">
            Aisle
          </Label>
          <Input
            id="aisle"
            type="text"
            value={aisle || ''}
            onChange={(e) => handleChange('aisle', e.target.value)}
            placeholder="e.g., 1"
          />
        </div>
        <div>
          <Label htmlFor="bin" className="text-xs font-medium mb-1.5">
            Bin
          </Label>
          <Input
            id="bin"
            type="text"
            value={bin || ''}
            onChange={(e) => handleChange('bin', e.target.value)}
            placeholder="e.g., B2"
          />
        </div>
        <div>
          <Label htmlFor="shelf" className="text-xs font-medium mb-1.5">
            Shelf
          </Label>
          <Input
            id="shelf"
            type="text"
            value={shelf || ''}
            onChange={(e) => handleChange('shelf', e.target.value)}
            placeholder="e.g., 3"
          />
        </div>
      </div>

      {/* Preview */}
      {(warehouse || zone || aisle || bin || shelf) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <MapPin className="w-4 h-4" />
          <span>
            {[
              warehouse,
              zone,
              [aisle, bin, shelf].filter(Boolean).join('-')
            ].filter(Boolean).join(' > ') || 'Location preview'}
          </span>
        </div>
      )}
    </div>
  );
};

