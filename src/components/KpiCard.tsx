import { Card, Statistic, Avatar } from "antd";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

const KpiCard = ({ title, value, icon }: KpiCardProps) => {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Statistic title={title} value={value} />
        <Avatar size="large" icon={icon} style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }} />
      </div>
    </Card>
  );
};

export default KpiCard;