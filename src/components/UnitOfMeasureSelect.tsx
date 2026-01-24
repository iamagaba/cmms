import { Input } from '@/components/ui/input';

// ... other imports

// ... inside UnitOfMeasureSelect ...

<Input
  type="number"
  min="1"
  value={unitsPerPackage}
  onChange={(e) => onUnitsPerPackageChange(Math.max(1, parseInt(e.target.value) || 1))}
  className="w-full"
  placeholder="1"
/>
          </div >
        )}
      </div >

  {/* Info Box */ }
{
  showConversionFactor && unitsPerPackage > 1 && (
    <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
      <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <span className="text-blue-700 dark:text-blue-300">
        1 {UNIT_OF_MEASURE_LABELS[unit].toLowerCase()} = {unitsPerPackage} individual items
      </span>
    </div>
  )
}
    </div >
  );
};
