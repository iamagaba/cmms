import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { theme } from 'antd';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, setOpen }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      style={{
        fontFamily: token.fontFamily,
        backgroundColor: token.colorBgElevated,
        color: token.colorText,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
      }}
    >
      <Command.Input
        placeholder="Type a command or search..."
        style={{
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          backgroundColor: 'transparent',
          color: token.colorText,
          fontSize: token.fontSizeLG,
          outline: 'none',
        }}
      />
      <Command.List
        style={{
            maxHeight: 300,
            overflow: 'auto',
            padding: '8px',
        }}
      >
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Navigation">
          <Command.Item onSelect={() => runCommand(() => navigate('/'))}>
            <Icon icon="ph:house-bold" /> Go to Dashboard
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => navigate('/work-orders'))}>
            <Icon icon="ph:wrench-bold" /> Go to Work Orders
          </Command.Item>
          <Command.Item onSelect={() => runCommand(() => navigate('/settings'))}>
            <Icon icon="ph:gear-six-bold" /> Go to Settings
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item onSelect={() => runCommand(() => navigate('/work-orders/new'))}>
             <Icon icon="ph:plus-bold" /> Create New Work Order
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandPalette;
