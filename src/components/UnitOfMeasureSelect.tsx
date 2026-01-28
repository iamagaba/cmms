import { Info } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';



export const UNIT_OF_MEASURE_LABELS: Record<string, string> = {
  each: 'Each',
  box: 'Box',
  case: 'Case',
  pack: 'Pack',
  carton: 'Carton',
  pallet: 'Pallet',
};

interface UnitOfMeasureSelectProps {
  unit: string;
  unitsPerPackage: number;
  onUnitChange: (unit: string) => void;
  onUnitsPerPackageChange: (unitsPerPackage: number) => void;
  showConversionFactor?: boolean;
}

export const UnitOfMeasureSelect: React.FC<UnitOfMeasureSelectProps> = ({
  unit,
  unitsPerPackage,
  onUnitChange,
  onUnitsPerPackageChange,
  showConversionFactor = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Unit of Measure Selector */}
      <div>
        <Label>Unit of Measure</Label>
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Units Per Package (only show if not 'each') */}
      {unit !== 'each' && (
        <div>
          <Label>Units Per {UNIT_OF_MEASURE_LABELS[unit]}</Label>
          <Input
            type="number"
            min="1"
            value={unitsPerPackage}
            onChange={(e) => onUnitsPerPackageChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full"
            placeholder="1"
          />
        </div>
      )}

      {/* Info Box */}
      {showConversionFactor && unitsPerPackage > 1 && (
        <div className="flex items-start gap-2 text-sm bg-muted dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          <Info className="w-5 h-5 text-muted-foreground dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground dark:text-blue-300">
            1 {UNIT_OF_MEASURE_LABELS[unit].toLowerCase()} = {unitsPerPackage} individual items
          </span>
        </div>
      )}
    </div>
  );
};
