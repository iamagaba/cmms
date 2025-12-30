/**
 * Icon Test Component
 * 
 * This component tests that Hugeicons are working correctly.
 * Use this to verify the installation before starting migration.
 * 
 * To test: Import this component in any page temporarily
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Calendar01Icon,
  Location01Icon,
  Motorbike01Icon,
  Home01Icon,
  Search01Icon,
  Settings01Icon,
  Add01Icon,
  Edit01Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons';

export const IconTest: React.FC = () => {
  const testIcons = [
    { name: 'User', Icon: UserIcon },
    { name: 'Calendar', Icon: Calendar01Icon },
    { name: 'Location', Icon: Location01Icon },
    { name: 'Motorbike', Icon: Motorbike01Icon },
    { name: 'Home', Icon: Home01Icon },
    { name: 'Search', Icon: Search01Icon },
    { name: 'Settings', Icon: Settings01Icon },
    { name: 'Add', Icon: Add01Icon },
    { name: 'Edit', Icon: Edit01Icon },
    { name: 'Delete', Icon: Delete01Icon },
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Hugeicons Test - Installation Verification
      </h2>
      
      <div className="space-y-6">
        {/* Size Test */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Size Variations</h3>
          <div className="flex items-center gap-4">
            <HugeiconsIcon icon={UserIcon} size={12} className="text-gray-600" />
            <HugeiconsIcon icon={UserIcon} size={16} className="text-gray-600" />
            <HugeiconsIcon icon={UserIcon} size={20} className="text-gray-600" />
            <HugeiconsIcon icon={UserIcon} size={24} className="text-gray-600" />
            <HugeiconsIcon icon={UserIcon} size={32} className="text-gray-600" />
            <HugeiconsIcon icon={UserIcon} size={48} className="text-gray-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">12px, 16px, 20px, 24px, 32px, 48px</p>
        </div>

        {/* Color Test */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Color Variations</h3>
          <div className="flex items-center gap-4">
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-blue-600" />
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-emerald-600" />
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-amber-600" />
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-red-600" />
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-purple-600" />
            <HugeiconsIcon icon={Calendar01Icon} size={24} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Blue, Emerald, Amber, Red, Purple, Gray</p>
        </div>

        {/* Icon Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Common Icons</h3>
          <div className="grid grid-cols-5 gap-6">
            {testIcons.map(({ name, Icon }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <HugeiconsIcon icon={Icon} size={24} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Example */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Usage Example</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs text-gray-800 overflow-x-auto">
{`import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon } from '@hugeicons/core-free-icons';

<HugeiconsIcon 
  icon={UserIcon} 
  size={16} 
  className="text-gray-400" 
/>`}
            </pre>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-900">
              ✓ Hugeicons installed and working correctly!
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-2">
            You can now start migrating components. Remove this test component when done.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IconTest;
