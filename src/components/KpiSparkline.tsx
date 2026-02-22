import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

interface KpiSparklineProps {
  variant: 'line' | 'area' | 'bar';
  validSparklineData: { value: number }[];
  comparisonBarData: { name: string; value: number; fill?: string }[];
  showSparklineTooltip: boolean;
  precision: number;
  title: string;
  effectiveSparklineColor: string;
  // sparklineGradient intentionally unused here; gradient stop opacities are hardcoded
}

const KpiSparkline: React.FC<KpiSparklineProps> = ({
  variant,
  validSparklineData,
  comparisonBarData,
  showSparklineTooltip,
  precision,
  title,
  effectiveSparklineColor,
}) => {
  // Render appropriate MUI X Charts visualization depending on variant
  if (variant === 'line' && validSparklineData.length > 0) {
    return (
      <LineChart
        xAxis={[{ 
          data: validSparklineData.map((_, i) => i),
          hideTooltip: !showSparklineTooltip,
          disableLine: true,
          disableTicks: true
        }]}
        series={[{
          data: validSparklineData.map(d => d.value),
          color: effectiveSparklineColor,
          showMark: false,
          curve: 'monotoneX',
          label: title
        }]}
        height={60}
        margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
        slotProps={{
          legend: { hidden: true }
        }}
        sx={{
          '& .MuiChartsAxis-root': { display: 'none' },
          '& .MuiChartsGrid-root': { display: 'none' }
        }}
      />
    );
  }

  if (variant === 'area' && validSparklineData.length > 0) {
    return (
      <LineChart
        xAxis={[{ 
          data: validSparklineData.map((_, i) => i),
          hideTooltip: !showSparklineTooltip,
          disableLine: true,
          disableTicks: true
        }]}
        series={[{
          data: validSparklineData.map(d => d.value),
          color: effectiveSparklineColor,
          showMark: false,
          curve: 'monotoneX',
          area: true,
          label: title
        }]}
        height={60}
        margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
        slotProps={{
          legend: { hidden: true }
        }}
        sx={{
          '& .MuiChartsAxis-root': { display: 'none' },
          '& .MuiChartsGrid-root': { display: 'none' }
        }}
      />
    );
  }

  if (variant === 'bar' && comparisonBarData.length > 0) {
    return (
      <BarChart
        xAxis={[{ 
          data: comparisonBarData.map(d => d.name),
          scaleType: 'band',
          hideTooltip: !showSparklineTooltip,
          disableLine: true,
          disableTicks: true
        }]}
        series={[{
          data: comparisonBarData.map(d => d.value),
          color: effectiveSparklineColor
        }]}
        height={60}
        margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
        slotProps={{
          legend: { hidden: true }
        }}
        sx={{
          '& .MuiChartsAxis-root': { display: 'none' },
          '& .MuiChartsGrid-root': { display: 'none' }
        }}
      />
    );
  }

  return <div />;
};

export default KpiSparkline;
