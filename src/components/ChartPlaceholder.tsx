import React from 'react';
import { BarChart3 } from 'lucide-react';

// Temporary placeholder for MUI charts during react-is version conflict resolution
export const BarChart = ({ ...props }) => (
  <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
    <div className="text-center">
      <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Chart temporarily disabled</p>
    </div>
  </div>
);

export const PieChart = ({ ...props }) => (
  <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
    <div className="text-center">
      <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Chart temporarily disabled</p>
    </div>
  </div>
);

export const LineChart = ({ ...props }) => (
  <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
    <div className="text-center">
      <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Chart temporarily disabled</p>
    </div>
  </div>
);