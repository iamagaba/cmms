import { Input, Tag, Button, Space } from "antd";
import React from "react";

interface TableFiltersBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterChips: { label: string; onClose: () => void }[];
  onClearAll: () => void;
  placeholder?: string;
  compact?: boolean; // render inline without extra margins for header actions
}

export const TableFiltersBar: React.FC<TableFiltersBarProps> = ({
  searchValue,
  onSearchChange,
  filterChips,
  onClearAll,
  placeholder = "Search...",
  compact = false,
}) => {
  const hasActiveFilters = filterChips.length > 0 || !!searchValue;
  return (
    <div style={{ marginBottom: compact ? 0 : 16, display: compact ? 'inline-flex' as const : 'block' }}>
      <Space size="middle" align="center" wrap>
        <Input.Search
          placeholder={placeholder}
          allowClear
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          style={{ width: 250 }}
        />
        {hasActiveFilters && (
          <Space size={[0, 8]} wrap>
            {filterChips.map(chip => (
              <Tag key={chip.label} closable onClose={chip.onClose} color="purple">
                {chip.label}
              </Tag>
            ))}
            <Button size="small" onClick={onClearAll}>
              Clear All
            </Button>
          </Space>
        )}
      </Space>
    </div>
  );
};
