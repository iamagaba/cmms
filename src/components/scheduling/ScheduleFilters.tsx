import React from 'react';
import { Card, Space, Select, DatePicker, Input, Button } from 'antd';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Status = 'Open' | 'Confirmation' | 'Ready' | 'In Progress' | 'On Hold' | 'Completed' | 'All';
type Priority = 'High' | 'Medium' | 'Low' | 'All';

interface FiltersState {
  status: Status;
  priority: Priority;
  technicianId: string | 'All';
  date: string | null; // ISO date string for selected day/week anchor
  search: string;
}

const defaultFilters: FiltersState = {
  status: 'All',
  priority: 'All',
  technicianId: 'All',
  date: null,
  search: '',
};

interface ScheduleFiltersProps {
  technicians?: { id: string; name: string }[];
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({ technicians = [] }) => {
  const [filters, setFilters] = useLocalStorage<FiltersState>('schedule:filters', defaultFilters);
  const [views, setViews] = useLocalStorage<Record<string, FiltersState>>('schedule:savedViews', {});

  const saveCurrentAs = () => {
    const name = window.prompt('Save current filters as view name:');
    if (!name) return;
    setViews({ ...views, [name]: filters });
  };

  const loadView = (name: string) => {
    const v = views[name];
    if (v) setFilters(v);
  };

  return (
    <Card size="small" bodyStyle={{ padding: 12 }}>
      <Space wrap>
        <Select
          size="middle"
          style={{ width: 160 }}
          value={filters.status}
          onChange={(status) => setFilters({ ...filters, status })}
          options={[
            { label: 'Status: All', value: 'All' },
            'Open', 'Confirmation', 'Ready', 'In Progress', 'On Hold', 'Completed'
          ].map((x: any) => typeof x === 'string' ? ({ label: x, value: x }) : x)}
        />
        <Select
          size="middle"
          style={{ width: 140 }}
          value={filters.priority}
          onChange={(priority) => setFilters({ ...filters, priority })}
          options={[{ label: 'Priority: All', value: 'All' }, 'High', 'Medium', 'Low'].map((x: any) => typeof x === 'string' ? ({ label: x, value: x }) : x)}
        />
        <Select
          size="middle"
          style={{ width: 160 }}
          value={filters.technicianId}
          onChange={(technicianId) => setFilters({ ...filters, technicianId })}
          options={[{ label: 'All Technicians', value: 'All' }, ...technicians.map(t => ({ label: t.name, value: t.id }))]}
        />
        <DatePicker
          onChange={(d) => setFilters({ ...filters, date: d ? d.startOf('day').toISOString() : null })}
          placeholder="Anchor date"
        />
        <Input.Search
          allowClear
          placeholder="Search work orders, customers, assets"
          style={{ width: 280 }}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          placeholder="Saved views"
          style={{ width: 200 }}
          onChange={(name) => loadView(name)}
          options={Object.keys(views).map(name => ({ label: name, value: name }))}
          allowClear
        />
        <Button onClick={saveCurrentAs}>Save view</Button>
      </Space>
    </Card>
  );
};

export default ScheduleFilters;
