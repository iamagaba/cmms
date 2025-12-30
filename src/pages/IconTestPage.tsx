/**
 * Temporary Icon Test Page
 * This page tests that Hugeicons are working correctly.
 * DELETE THIS FILE after verification is complete.
 */

import React from 'react';
import { IconTest } from '../components/icons/IconTest';

export const IconTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <IconTest />
      </div>
    </div>
  );
};

export default IconTestPage;
