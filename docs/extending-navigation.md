# Extending Navigation Features

This guide shows how to customize and extend the command palette and contextual top bar.

## Adding Commands to Command Palette

### 1. Add a New Navigation Item

Edit `src/components/navigation/CommandPalette.tsx`:

```tsx
<CommandGroup heading="Navigation">
  {/* Existing items... */}
  
  {/* Add your new item */}
  <CommandItem
    onSelect={() => handleSelect(() => navigate('/your-new-page'))}
  >
    <YourIcon className="w-4 h-4 mr-2" />
    <span>Your New Page</span>
  </CommandItem>
</CommandGroup>
```

### 2. Add a Quick Action

```tsx
<CommandGroup heading="Qui