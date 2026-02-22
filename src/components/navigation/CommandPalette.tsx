import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  ClipboardList,
  Building2,
  Users,
  Wrench,
  Archive,
  MapPin,
  Calendar,
  TrendingUp,
  Settings,
  Plus,
  Search,
  FileText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Fetch recent work orders for quick access
  const { data: recentWorkOrders } = useQuery({
    queryKey: ['recent-work-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, title, work_order_number, status')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch recent assets
  const { data: recentAssets } = useQuery({
    queryKey: ['recent-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, license_plate, make, model')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/'))}
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/work-orders'))}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            <span>Work Orders</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/assets'))}
          >
            <Building2 className="w-4 h-4 mr-2" />
            <span>Assets</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/customers'))}
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Customers</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/technicians'))}
          >
            <Wrench className="w-4 h-4 mr-2" />
            <span>Technicians</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/inventory'))}
          >
            <Archive className="w-4 h-4 mr-2" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/locations'))}
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span>Service Centers</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/scheduling'))}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>Scheduling</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/reports'))}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate('/settings'))}
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => handleSelect(() => {
              navigate('/work-orders');
              // Trigger create dialog - you'll need to implement this
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Create Work Order</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => {
              navigate('/assets');
              // Trigger create dialog
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add Asset</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => {
              navigate('/customers');
              // Trigger create dialog
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add Customer</span>
          </CommandItem>
        </CommandGroup>

        {recentWorkOrders && recentWorkOrders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Work Orders">
              {recentWorkOrders.map((wo) => (
                <CommandItem
                  key={wo.id}
                  onSelect={() => handleSelect(() => navigate(`/work-orders/${wo.id}`))}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>
                    {wo.work_order_number} - {wo.title}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {recentAssets && recentAssets.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Assets">
              {recentAssets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  onSelect={() => handleSelect(() => navigate(`/assets/${asset.id}`))}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  <span>
                    {asset.license_plate} - {asset.make} {asset.model}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
