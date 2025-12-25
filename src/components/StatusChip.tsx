import React from 'react';
import { Tag, theme } from 'antd';

export type StatusKind = 'Open' | 'Confirmation' | 'Ready' | 'In Progress' | 'On Hold' | 'Completed';
export type PriorityKind = 'High' | 'Medium' | 'Low';

export interface StatusChipProps {
  kind: 'status' | 'priority' | 'channel' | 'tech' | 'custom';
  value: string | number;
  bordered?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  color?: string; // Optional custom color override
}

export const StatusChip: React.FC<StatusChipProps> = ({
  kind,
  value,
  bordered = false,
  clickable = false,
  onClick,
  color,
}) => {
  const { token } = theme.useToken();

  const neutralBg = token.colorFillSecondary;
  const neutralFg = token.colorText;
  const solidFg = token.colorTextLightSolid;

  let bg = color || neutralBg;
  let fg = color ? solidFg : neutralFg;

  if (!color) {
    if (kind === 'status') {
      const v = String(value) as StatusKind;
      switch (v) {
        case 'Open':
          bg = token.colorInfo;
          fg = solidFg;
          break;
        case 'Confirmation':
          bg = token.colorInfo;
          fg = solidFg;
          break;
        case 'Ready':
          bg = neutralBg;
          fg = neutralFg;
          break;
        case 'In Progress':
          bg = token.colorWarning;
          fg = solidFg;
          break;
        case 'On Hold':
          bg = token.colorWarning;
          fg = solidFg;
          break;
        case 'Completed':
          bg = token.colorSuccess;
          fg = solidFg;
          break;
        default:
          bg = token.colorInfo;
          fg = solidFg;
      }
    } else if (kind === 'priority') {
      const v = String(value) as PriorityKind;
      switch (v) {
        case 'High':
          bg = token.colorError;
          fg = solidFg;
          break;
        case 'Medium':
          bg = token.colorWarning;
          fg = solidFg;
          break;
        case 'Low':
          bg = token.colorSuccess;
          fg = solidFg;
          break;
        default:
          bg = neutralBg;
          fg = neutralFg;
      }
    } else if (kind === 'tech') {
      const v = String(value).toLowerCase();
      if (v === 'available') { bg = token.colorSuccess; fg = solidFg; }
      else if (v === 'busy') { bg = token.colorWarning; fg = solidFg; }
      else if (v === 'offline') { bg = neutralBg; fg = token.colorTextTertiary; }
      else { bg = token.colorInfo; fg = solidFg; }
    } else {
      // channel/custom default
      bg = token.colorInfo;
      fg = solidFg;
    }
  }

  return (
    <Tag
      bordered={bordered}
      style={{
        backgroundColor: bg,
        borderColor: bg,
        color: fg,
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      {String(value)}
    </Tag>
  );
};

export default StatusChip;