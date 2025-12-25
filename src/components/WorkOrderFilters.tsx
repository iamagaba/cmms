import { Row, Col, Input, Select, Tag, Button, Space } from "antd";

import { Technician, Location } from "@/types/supabase";

const { Search } = Input;

export interface WorkOrderFiltersProps {
  vehicleFilter: string;
  statusFilter: string | undefined;
  priorityFilter: string | undefined;
  technicianFilter: string | undefined;
  channelFilter: string | undefined;
  onVehicleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string | undefined) => void;
  onPriorityFilterChange: (value: string | undefined) => void;
  onTechnicianFilterChange: (value: string | undefined) => void;
  onChannelFilterChange: (value: string | undefined) => void;
  technicians: Technician[];
  locations: Location[];
  view: string;
  groupBy: string;
  onGroupByChange: (value: string) => void;
}

const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  vehicleFilter,
  statusFilter,
  priorityFilter,
  technicianFilter,
  channelFilter,
  onVehicleFilterChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTechnicianFilterChange,
  onChannelFilterChange,
  technicians = [],
  locations = [],
  view,
  groupBy,
  onGroupByChange,
}) => {
  // Filter chips
  const filterChips = [];
  if (vehicleFilter) filterChips.push({ label: `Vehicle: ${vehicleFilter}`, onClose: () => onVehicleFilterChange('') });
  if (statusFilter) filterChips.push({ label: `Status: ${statusFilter}`, onClose: () => onStatusFilterChange(undefined) });
  if (priorityFilter) filterChips.push({ label: `Priority: ${priorityFilter}`, onClose: () => onPriorityFilterChange(undefined) });
  if (technicianFilter) {
    const tech = technicians.find(t => t.id === technicianFilter);
    filterChips.push({ label: `Technician: ${tech ? tech.name : technicianFilter}`, onClose: () => onTechnicianFilterChange(undefined) });
  }
  if (channelFilter) {
    const loc = locations.find(l => l.id === channelFilter);
    filterChips.push({ label: `Location: ${loc ? loc.name : channelFilter}`, onClose: () => onChannelFilterChange(undefined) });
  }

  const hasActiveFilters = filterChips.length > 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={[12, 12]} align="middle" wrap>
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Filter by Vehicle ID..."
            allowClear
            onSearch={onVehicleFilterChange}
            onChange={(e) => onVehicleFilterChange(e.target.value)}
            value={vehicleFilter}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: '100%' }}
            onChange={onStatusFilterChange}
            value={statusFilter}
          >
            <Select.Option value="Open">Open</Select.Option>
            <Select.Option value="Confirmation">Confirmation</Select.Option>
            <Select.Option value="Ready">Ready</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="On Hold">On Hold</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filter by Priority"
            allowClear
            style={{ width: '100%' }}
            onChange={onPriorityFilterChange}
            value={priorityFilter}
          >
            <Select.Option value="High">High</Select.Option>
            <Select.Option value="Medium">Medium</Select.Option>
            <Select.Option value="Low">Low</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Select
            placeholder="Filter by Technician"
            allowClear
            style={{ width: '100%' }}
            onChange={onTechnicianFilterChange}
            value={technicianFilter}
          >
            {technicians.map(t => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Select
            placeholder="Filter by Location"
            allowClear
            style={{ width: '100%' }}
            onChange={onChannelFilterChange}
            value={channelFilter}
          >
            {locations.map(l => (
              <Select.Option key={l.id} value={l.id}>
                {l.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        {view === 'kanban' && (
          <Col xs={24} sm={12} md={2}>
            <Select
              value={groupBy}
              onChange={onGroupByChange}
              style={{ width: '100%' }}
            >
              <Select.Option value="status">Group by: Status</Select.Option>
              <Select.Option value="priority">Group by: Priority</Select.Option>
              <Select.Option value="technician">Group by: Technician</Select.Option>
            </Select>
          </Col>
        )}
      </Row>
      {hasActiveFilters && (
        <Space size={[0, 8]} wrap style={{ marginTop: 12 }}>
          {filterChips.map((chip) => (
            <Tag key={chip.label} closable onClose={chip.onClose} color="purple">
              {chip.label}
            </Tag>
          ))}
          <Button size="small" onClick={() => {
            onVehicleFilterChange('');
            onStatusFilterChange(undefined);
            onPriorityFilterChange(undefined);
            onTechnicianFilterChange(undefined);
            onChannelFilterChange(undefined);
          }}>
            Clear All
          </Button>
        </Space>
      )}
    </div>
  );
};

export default WorkOrderFilters;