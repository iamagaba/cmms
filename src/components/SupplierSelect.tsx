import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// ... imports remain the same ...

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
  value,
  onChange,
  allowCreate = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const { data: suppliers, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();

  const selectedSupplier = useMemo(() => {
    if (!value || !suppliers) return null;
    return suppliers.find(s => s.id === value) || null;
  }, [value, suppliers]);

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;

    try {
      const newSupplier = await createMutation.mutateAsync({
        name: newSupplierName.trim(),
        contact_name: null,
        phone: null,
        email: null,
        address: null,
        notes: null,
      });
      onChange(newSupplier.id);
      setShowCreateForm(false);
      setNewSupplierName('');
      setIsOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {selectedSupplier?.name || 'Select supplier...'}
          <HugeiconsIcon
            icon={Building01Icon}
            size={16}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search suppliers..." />
          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {allowCreate && !showCreateForm && (
                <CommandItem
                  onSelect={() => setShowCreateForm(true)}
                  className="text-blue-600 cursor-pointer"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} className="mr-2" />
                  Create new supplier
                </CommandItem>
              )}
              {suppliers?.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.name}
                  onSelect={() => {
                    onChange(supplier.id === value ? null : supplier.id);
                    setIsOpen(false);
                  }}
                >
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    size={16}
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === supplier.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{supplier.name}</span>
                    {supplier.contact_name && (
                      <span className="text-xs text-muted-foreground">{supplier.contact_name}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {/* Create Form Overlay in Popover */}
        {showCreateForm && (
          <div className="p-3 border-t bg-background">
            <div className="space-y-2">
              <Input
                placeholder="Supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSupplier();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateSupplier}
                  disabled={!newSupplierName.trim() || createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewSupplierName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
{/* Create New Supplier */ }
{
  allowCreate && (
    <div className="border-t p-2">
      {showCreateForm ? (
        <div className="space-y-2">
          <Input
            placeholder="Supplier name"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateSupplier();
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateSupplier}
              disabled={!newSupplierName.trim() || createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false);
                setNewSupplierName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowCreateForm(true)}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
          Add new supplier
        </Button>
      )}
    </div>
  )
}
        </div >
      </PopoverContent >
    </Popover >
  );
};
