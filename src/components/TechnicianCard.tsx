import { Card, Avatar, Typography, Dropdown, Menu, Button, Tag, Tooltip, theme } from "antd";
import { useState } from "react";
import StatusChip from "@/components/StatusChip";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { Technician } from "@/types/supabase";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export type TechnicianCardData = Technician & {
  openTasks: number;
  location?: { name: string } | null;
};

interface TechnicianCardProps {
  technician: TechnicianCardData;
  onEdit: (technician: TechnicianCardData) => void;
  onDelete: (technician: TechnicianCardData) => void;
}


const statusTextMap: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
};

export const TechnicianCard = ({ technician, onEdit, onDelete }: TechnicianCardProps) => {
  const navigate = useNavigate();
  const [menuHover, setMenuHover] = useState(false);
  const { token } = theme.useToken();

  const handleCardClick = () => {
    navigate(`/technicians/${technician.id}`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<Icon icon="ph:pencil-fill" />} onClick={(e) => { e.domEvent.stopPropagation(); onEdit(technician); }}>
        Edit Details
      </Menu.Item>
      <Menu.Item key="delete" icon={<Icon icon="ph:trash-fill" />} danger onClick={(e) => { e.domEvent.stopPropagation(); onDelete(technician); }}>
        Delete Technician
      </Menu.Item>
    </Menu>
  );

  // Card style: white bg, subtle border, soft shadow, stronger on hover
  const [cardHover, setCardHover] = useState(false);
  const cardStyle = {
    height: '100%',
    cursor: 'pointer',
    padding: 0,
    minWidth: 0,
    borderRadius: 16,
    background: token.colorBgContainer,
    border: `1px solid ${cardHover ? token.colorBorder : token.colorSplit}`,
    boxShadow: cardHover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
  };

  return (
    <Card
      hoverable
      className="lift-on-hover technician-card-responsive"
      style={cardStyle}
      onClick={handleCardClick}
      bodyStyle={{ padding: 20 }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top row: Avatar, name, status, menu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size={56} src={technician.avatar || undefined} style={{ background: token.colorFillTertiary, color: token.colorPrimary, fontWeight: 700 }}>
              {technician.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <Title level={5} style={{ margin: 0, fontSize: 20, color: token.colorText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{technician.name}</Title>
              <div style={{ marginTop: 12 }}>
                <StatusChip
                  kind="tech"
                  value={statusTextMap[String(technician.status || 'offline').toLowerCase()]}
                />
              </div>
            </div>
          </div>
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              type="text"
              icon={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: menuHover ? token.colorPrimary : 'transparent',
                    transition: 'background 0.18s',
                  }}
                  onMouseEnter={() => setMenuHover(true)}
                  onMouseLeave={() => setMenuHover(false)}
                >
                  <Icon
                    icon="ph:dots-three-horizontal-fill"
                    color={menuHover ? token.colorTextLightSolid : token.colorPrimary}
                    width={22}
                    height={22}
                  />
                </span>
              }
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: 0,
                background: 'none',
                border: 'none',
                boxShadow: 'none',
                minWidth: 0,
                minHeight: 0,
                lineHeight: 1,
              }}
            />
          </Dropdown>
        </div>

        {/* Specializations as tags */}
        <div style={{ minHeight: 28, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          {technician.specializations && technician.specializations.length > 0 ? (
            technician.specializations.map((spec) => (
              <Tag key={spec} style={{
                fontSize: 12,
                borderRadius: 8,
                padding: '0 8px',
                margin: 0,
                background: token.colorPrimaryBg,
                color: token.colorPrimary,
                border: 'none',
                fontWeight: 500
              }}>{spec}</Tag>
            ))
          ) : (
            <Tag style={{ fontSize: 12, borderRadius: 8, margin: 0, background: token.colorPrimaryBg, color: token.colorPrimary, border: 'none', fontWeight: 500 }}>No Specialization</Tag>
          )}
        </div>

        {/* Service center and location info, stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginTop: 4 }}>
          {technician.location && (
            <span style={{ fontSize: 14, color: token.colorTextSecondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:map-pin-fill" /> {technician.location.name}
            </span>
          )}
          <Tooltip title="Phone">
            <span style={{ fontSize: 14, color: token.colorTextSecondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:phone-fill" /> {technician.phone || 'N/A'}
            </span>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};