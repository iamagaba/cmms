import React, { useMemo } from 'react';
import { Typography, Tooltip, Space, Card, Empty } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { WorkOrder, Vehicle } from '@/types/supabase';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { Text } = Typography;

interface AssetRepairHistoryTimelineProps {
  workOrders: WorkOrder[];
  vehicle: Vehicle;
}

interface WeeklyRepairData {
  weekStart: Dayjs;
  repairCount: number;
}

const getHealthColor = (count: number): string => {
  if (count === 0) return 'bg-gray-100'; // No repairs - neutral/healthy
  if (count >= 1 && count <= 2) return 'bg-green-200'; // Low activity - good health
  if (count >= 3 && count <= 4) return 'bg-yellow-300'; // Moderate activity - watch
  return 'bg-red-400'; // High activity - poor health
};

export const AssetRepairHistoryTimeline: React.FC<AssetRepairHistoryTimelineProps> = ({ workOrders, vehicle }) => {
  const timelineData = useMemo(() => {
    if (!workOrders.length && !vehicle.created_at && !vehicle.release_date) {
      return [];
    }

    let earliestDate: Dayjs | null = null;

    // Determine the earliest relevant date for the timeline
    if (workOrders.length > 0) {
      const oldestWorkOrderDate = dayjs(workOrders.reduce((min, wo) => 
        dayjs(wo.created_at).isBefore(dayjs(min.created_at)) ? wo : min
      ).created_at);
      earliestDate = oldestWorkOrderDate;
    }

    if (vehicle.release_date) {
      const releaseDate = dayjs(vehicle.release_date);
      if (!earliestDate || releaseDate.isBefore(earliestDate)) {
        earliestDate = releaseDate;
      }
    }
    if (vehicle.created_at) {
      const vehicleCreatedAt = dayjs(vehicle.created_at);
      if (!earliestDate || vehicleCreatedAt.isBefore(earliestDate)) {
        earliestDate = vehicleCreatedAt;
      }
    }

    // If no relevant dates, default to one year ago
    if (!earliestDate) {
      earliestDate = dayjs().subtract(1, 'year');
    }

    const startDate = earliestDate.startOf('week');
    const endDate = dayjs().endOf('week');

    const weeklyData: { [key: string]: number } = {};
    let currentWeek = startDate;

    while (currentWeek.isBefore(endDate) || currentWeek.isSame(endDate, 'week')) {
      const weekKey = currentWeek.format('YYYY-WW'); // Year-Week format
      weeklyData[weekKey] = 0;
      currentWeek = currentWeek.add(1, 'week');
    }

    workOrders.forEach(wo => {
      const woDate = dayjs(wo.created_at);
      const weekKey = woDate.startOf('week').format('YYYY-WW');
      if (Object.prototype.hasOwnProperty.call(weeklyData, weekKey)) {
        weeklyData[weekKey]++;
      }
    });

    const result: WeeklyRepairData[] = [];
    Object.keys(weeklyData).sort().forEach(weekKey => {
      const [year, weekNum] = weekKey.split('-').map(Number);
      // Reconstruct the start of the week from year and week number
      const weekStart = dayjs().year(year).week(weekNum).startOf('week');
      result.push({
        weekStart,
        repairCount: weeklyData[weekKey],
      });
    });

    return result;
  }, [workOrders, vehicle]);

  // Determine month/year markers for the timeline
  const monthMarkers = useMemo(() => {
    const markers: { label: string; position: number }[] = [];
    if (timelineData.length === 0) return markers;

    let currentMonth = timelineData[0].weekStart.startOf('month');
    const lastMonth = timelineData[timelineData.length - 1].weekStart.startOf('month');

    while (currentMonth.isSameOrBefore(lastMonth, 'month')) {
      const index = timelineData.findIndex(data => data.weekStart.isSame(currentMonth, 'month') || data.weekStart.isAfter(currentMonth, 'month'));
      if (index !== -1) {
        markers.push({
          label: currentMonth.format('MMM YYYY'),
          position: index,
        });
      }
      currentMonth = currentMonth.add(1, 'month');
    }
    return markers;
  }, [timelineData]);

  return (
  <Card size="small" title="Repair Activity Timeline" style={{ marginBottom: 16 }}>
      {timelineData.length === 0 ? (
        <Empty description="No repair history available for this asset." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
      <div className="relative w-full overflow-x-auto hide-scrollbar pb-4">
        <div className="flex items-end" style={{ minWidth: `${timelineData.length * 20}px` }}> {/* Adjust minWidth based on number of weeks */}
          {timelineData.map((data, index) => (
            <Tooltip
              key={index}
              title={
                <Space direction="vertical" size={0}>
                  <Text strong>{data.weekStart.format('MMM D, YYYY')}</Text>
                  <Text>{data.repairCount} repair{data.repairCount !== 1 ? 's' : ''}</Text>
                </Space>
              }
            >
              <div
                className={`w-5 h-8 border border-gray-200 cursor-pointer transition-colors duration-100 ${getHealthColor(data.repairCount)}`}
                style={{ flexShrink: 0 }}
              />
            </Tooltip>
          ))}
        </div>
        {/* Month/Year Markers */}
        <div className="absolute top-9 left-0 w-full flex pointer-events-none">
          {monthMarkers.map((marker, index) => (
            <div
              key={index}
              className="absolute text-xs text-gray-500 transform -translate-x-1/2"
              style={{ left: `${(marker.position / timelineData.length) * 100}%`, whiteSpace: 'nowrap' }}
            >
              {marker.label}
            </div>
          ))}
        </div>
      </div>
      )}
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 items-center">
        <Text strong>Health Legend:</Text>
        <Space size="small">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200" /> <Text>No Repairs</Text>
        </Space>
        <Space size="small">
          <div className="w-4 h-4 bg-green-200 border border-gray-200" /> <Text>1-2 Repairs (Good)</Text>
        </Space>
        <Space size="small">
          <div className="w-4 h-4 bg-yellow-300 border border-gray-200" /> <Text>3-4 Repairs (Moderate)</Text>
        </Space>
        <Space size="small">
          <div className="w-4 h-4 bg-red-400 border border-gray-200" /> <Text>5+ Repairs (Poor)</Text>
        </Space>
      </div>
    </Card>
  );
};