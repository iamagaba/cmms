import React, { useState } from 'react';
import { Form, Button, Select, Row, Col, Table, Typography, Space } from 'antd';
import { PrinterOutlined, FundViewOutlined } from '@ant-design/icons';
import { WorkOrder, Technician, Location } from '@/types/supabase';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

interface CustomReportGeneratorProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
}

const CustomReportGenerator: React.FC<CustomReportGeneratorProps> = ({ workOrders, technicians, locations }) => {
  const [form] = Form.useForm();
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportColumns, setReportColumns] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<Record<string, string | number>>({});

  const handleGenerateReport = (values: any) => {
    const { reportType, status, priority, technicianId, locationId } = values;

    const filteredWorkOrders = workOrders.filter(wo => {
      const statusMatch = !status || wo.status === status;
      const priorityMatch = !priority || wo.priority === priority;
      const technicianMatch = !technicianId || wo.assignedTechnicianId === technicianId;
      const locationMatch = !locationId || wo.locationId === locationId;
      return statusMatch && priorityMatch && technicianMatch && locationMatch;
    });

    if (reportType === 'work_order_summary') {
      setReportTitle('Work Order Summary Report');
      setReportColumns([
        { title: 'ID', dataIndex: 'workOrderNumber', key: 'workOrderNumber' },
        { title: 'Service', dataIndex: 'service', key: 'service' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        { title: 'Priority', dataIndex: 'priority', key: 'priority' },
        { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (date) => dayjs(date).format('YYYY-MM-DD') },
        { title: 'Completed At', dataIndex: 'completedAt', key: 'completedAt', render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A' },
      ]);
      setReportData(filteredWorkOrders);
      setReportSummary({
        "Total Work Orders": filteredWorkOrders.length,
        "Completed": filteredWorkOrders.filter(wo => wo.status === 'Completed').length,
        "In Progress": filteredWorkOrders.filter(wo => wo.status === 'In Progress').length,
      });
    } else if (reportType === 'technician_performance') {
      setReportTitle('Technician Performance Report');
      const techPerformanceData = technicians.map(tech => {
        const assignedOrders = filteredWorkOrders.filter(wo => wo.assignedTechnicianId === tech.id);
        return {
          key: tech.id,
          name: tech.name,
          totalAssigned: assignedOrders.length,
          completed: assignedOrders.filter(wo => wo.status === 'Completed').length,
          inProgress: assignedOrders.filter(wo => wo.status === 'In Progress').length,
          open: assignedOrders.filter(wo => wo.status === 'Open').length,
        };
      });
      setReportColumns([
        { title: 'Technician', dataIndex: 'name', key: 'name' },
        { title: 'Total Assigned', dataIndex: 'totalAssigned', key: 'totalAssigned' },
        { title: 'Completed', dataIndex: 'completed', key: 'completed' },
        { title: 'In Progress', dataIndex: 'inProgress', key: 'inProgress' },
        { title: 'Open', dataIndex: 'open', key: 'open' },
      ]);
      setReportData(techPerformanceData);
      setReportSummary({
        "Total Technicians": technicians.length,
        "Total Assigned Tasks": filteredWorkOrders.length,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="report-generator-form">
        <Form form={form} layout="vertical" onFinish={handleGenerateReport} initialValues={{ reportType: 'work_order_summary' }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="reportType" label="Report Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="work_order_summary">Work Order Summary</Option>
                  <Option value="technician_performance">Technician Performance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}><Form.Item name="status" label="Status"><Select allowClear><Option value="Open">Open</Option><Option value="In Progress">In Progress</Option><Option value="On Hold">On Hold</Option><Option value="Completed">Completed</Option></Select></Form.Item></Col>
            <Col xs={24} md={4}><Form.Item name="priority" label="Priority"><Select allowClear><Option value="High">High</Option><Option value="Medium">Medium</Option><Option value="Low">Low</Option></Select></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name="technicianId" label="Technician"><Select allowClear>{technicians.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}</Select></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name="locationId" label="Location"><Select allowClear>{locations.map(l => <Option key={l.id} value={l.id}>{l.name}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" icon={<FundViewOutlined />}>Generate Report</Button>
        </Form>
      </div>

      {reportData && (
        <div id="report-area" style={{ marginTop: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4}>{reportTitle}</Title>
              <Text type="secondary">Generated on: {dayjs().format('YYYY-MM-DD HH:mm')}</Text>
            </Col>
            <Col className="report-generator-form">
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>Print Report</Button>
            </Col>
          </Row>
          <Row gutter={16} style={{ margin: '16px 0' }}>
            {Object.entries(reportSummary).map(([key, value]) => (
              <Col key={key}><Text strong>{key}:</Text> <Text>{value}</Text></Col>
            ))}
          </Row>
          <Table dataSource={reportData} columns={reportColumns} pagination={false} size="small" />
        </div>
      )}
    </div>
  );
};

export default CustomReportGenerator;