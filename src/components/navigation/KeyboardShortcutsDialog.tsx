import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘', 'K'], description: 'Open quick search' },
        { keys: ['⌘', '1'], description: 'Go to Dashboard' },
        { keys: ['⌘', '2'], description: 'Go to Work Orders' },
        { keys: ['⌘', '3'], description: 'Go to Assets' },
        { keys: ['⌘', '4'], description: 'Go to Customers' },
        { keys: ['⌘', '5'], description: 'Go to Technicians' },
        { keys: ['⌘', '6'], description: 'Go to Inventory' },
        { keys: ['⌘', '7'], description: 'Go to Scheduling' },
        { keys: ['⌘', '8'], description: 'Go to Reports' },
      ],
    },
    {
      category: 'General',
      items: [
        { keys: ['⌘', '?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close dialog/modal' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border bg-muted px-2 font-mono text-xs font-medium">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Tip:</span> On Windows/Linux, use{' '}
            <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
              Ctrl
            </kbd>{' '}
            instead of{' '}
            <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px]">
              ⌘
            </kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
