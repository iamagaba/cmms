
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Icon } from '@iconify/react';

export const WorkOrderTrendsChart = ({ data }: { data: any[] }) => {
    const getOption = () => ({
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#111827', fontSize: 12 },
            extraCssText: 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border-radius: 8px;'
        },
        grid: {
            top: '10%',
            left: '3%',
            right: '3%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(d => d.date),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: true, lineStyle: { color: '#f3f4f6', type: 'dashed' } },
            axisLabel: { show: false }
        },
        series: [
            {
                name: 'Work Orders',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#3b82f6' },
                itemStyle: { color: '#3b82f6' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.1)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0)' }
                        ]
                    }
                },
                data: data.map(d => d.count)
            }
        ]
    });

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Icon icon="tabler:chart-line" className="w-4 h-4 text-gray-500" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Work Order Trends</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Last 7 days activity</p>
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="p-6">
                <div className="h-[180px] w-full">
                    <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                </div>
            </div>
        </div>
    );
};
