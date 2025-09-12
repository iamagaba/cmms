import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Profile, Location } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from "@/components/Breadcrumbs";
import ServiceSlaManagement from '@/components/ServiceSlaManagement';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload } from "lucide-react"; // Using Lucide icon for upload
import { Loader2, Plus, Pencil, Trash2, User, Mail, Lock, Eye, EyeOff, Settings as SettingsIcon, Bell, Wrench, Users, Gauge } from "lucide-react"; // Icons
import { TechnicianDataTableShadcn } from '@/components/shadcn/TechnicianDataTableShadcn'; // New shadcn table
import { TechnicianFormSheet } from '@/components/shadcn/TechnicianFormSheet'; // New shadcn sheet form
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- User Management Tab ---
const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(snakeToCamelCase) as Technician[];
    }
  });
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({ queryKey: ['work_orders'], queryFn: async () => { const { data, error } = await supabase.from('work_orders').select('*'); if (error) throw new Error(error.message); return data || []; } });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({ queryKey: ['locations'], queryFn: async () => { const { data, error } = await supabase.from('locations').select('*'); if (error) throw new Error(error.message); return data || []; } });

  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => {
      const snakeCaseData = camelToSnakeCase(technicianData);
      if (technicianData.id) {
        const { error } = await supabase
          .from('technicians')
          .update(snakeCaseData)
          .eq('id', technicianData.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('technicians').insert([snakeCaseData]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been saved.');
      setIsSheetOpen(false);
      setEditingTechnician(null);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician has been deleted.');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (technicianData: Technician) => {
    technicianMutation.mutate(technicianData);
  };

  const handleDeleteClick = (technician: Technician) => { // Changed to accept Technician object
    setItemToDelete(technician.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setIsSheetOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: Technician['status']) => {
    const { data: currentTechnicianRaw, error: fetchError } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      showError(`Failed to fetch technician data: ${fetchError.message}`);
      return;
    }
    if (!currentTechnicianRaw) {
      showError("Technician not found.");
      return;
    }

    const currentTechnician = snakeToCamelCase(currentTechnicianRaw) as Technician;

    const updatedTechnicianData: Partial<Technician> = {
      ...currentTechnician,
      status: status,
    };

    technicianMutation.mutate(updatedTechnicianData);
  };

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders || isLoadingLocations;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Manage Users</CardTitle>
        <Button onClick={() => { setEditingTechnician(null); setIsSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </CardHeader>
      <div className="p-6">
        {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
          <TechnicianDataTableShadcn
            technicians={technicians || []}
            workOrders={workOrders || []}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={() => {}} // Placeholder for now, as this table is for management
          />
        )}
      </div>
      {isSheetOpen && (
        <TechnicianFormSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSave={handleSave}
          technician={editingTechnician}
          locations={locations || []}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the technician.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// --- System Settings Tab ---
const systemSettingsFormSchema = z.object({
  notifications: z.boolean(),
  defaultPriority: z.enum(["Low", "Medium", "High"]),
  slaThreshold: z.coerce.number().int().min(0).optional(), // Made optional
});

const SystemSettings = () => {
  const form = useForm<z.infer<typeof systemSettingsFormSchema>>({
    resolver: zodResolver(systemSettingsFormSchema),
    defaultValues: {
      notifications: true, // Explicit default matching schema
      defaultPriority: "Medium", // Explicit default matching schema
      slaThreshold: undefined, // Explicit default matching schema (undefined for optional)
    },
  });
  const queryClient = useQueryClient();
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settingsToUpdate: { key: string; value: string | boolean | number | null }[]) => {
      const { error } = await supabase.from('system_settings').upsert(settingsToUpdate);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_settings'] });
      showSuccess('System settings have been updated.');
    },
    onError: (error) => showError(error.message),
  });

  useEffect(() => {
    if (!isLoadingSettings && settings) {
      form.reset({
        notifications: settings.notifications === 'true',
        defaultPriority: (settings.defaultPriority as "Low" | "Medium" | "High") || 'Medium',
        slaThreshold: settings.slaThreshold ? parseInt(settings.slaThreshold) : undefined, // Use undefined for optional
      });
    }
  }, [isLoadingSettings, settings, form]);

  const logoUrl = settings.logo_url;

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('system_assets')
      .upload(filePath, file);

    if (uploadError) {
      showError(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('system_assets')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('system_settings')
      .upsert([{ key: 'logo_url', value: publicUrl }]);

    if (dbError) {
      showError(`Failed to save logo URL: ${dbError.message}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['system_settings'] });
    showSuccess('Logo updated successfully.');
  };

  if (isLoadingSettings) {
    return <Card className="w-full"><CardHeader><CardTitle>System Configuration</CardTitle></CardHeader><div className="p-6"><Skeleton className="h-[300px] w-full" /></div></Card>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>Manage general application settings.</CardDescription>
      </CardHeader>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => {
            const settingsToUpdate = Object.keys(values).map(key => ({
              key,
              value: (values as any)[key],
            }));
            updateSystemSettingsMutation.mutate(settingsToUpdate);
          })} className="space-y-6">
            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                    <FormDescription>
                      Toggle all system-wide email notifications for events like work order creation and status changes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultPriority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Work Order Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the default priority for all newly created work orders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slaThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLA Warning Threshold (days)</FormLabel>
                  <FormControl>
                    <Input type="number" className="w-[180px]" placeholder="e.g. 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    Get a warning for work orders that are due within this many days.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col space-y-2">
              <FormLabel>System Logo</FormLabel>
              <FormDescription>
                Upload a logo to be displayed in the header and sidebar. Recommended size: 128x128px.
              </FormDescription>
              <div className="flex items-center space-x-4">
                {logoUrl && <Avatar className="h-16 w-16 rounded-md"><AvatarImage src={logoUrl} alt="System Logo" /></Avatar>}
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button asChild variant="outline">
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" /> Change Logo
                    </span>
                  </Button>
                  <Input id="logo-upload" type="file" className="sr-only" onChange={handleLogoUpload} accept=".png,.jpg,.jpeg,.svg" />
                </Label>
              </div>
            </FormItem>

            <Button type="submit" disabled={updateSystemSettingsMutation.isPending}>
              {updateSystemSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

// --- Profile Settings Tab ---
const profileSettingsFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  is_admin: z.boolean(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword || data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

const ProfileSettings = () => {
  const { session } = useSession();
  const user = session?.user;
  const form = useForm<z.infer<typeof profileSettingsFormSchema>>({
    resolver: zodResolver(profileSettingsFormSchema),
    defaultValues: {
      name: "",
      email: "",
      is_admin: false, // Explicit default
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { first_name?: string; last_name?: string; avatar_url?: string; is_admin?: boolean }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Your profile has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      showSuccess('Your password has been updated.');
      form.resetField('currentPassword');
      form.resetField('newPassword');
      form.resetField('confirmPassword');
    },
    onError: (error) => showError(error.message),
  });

  useEffect(() => {
    if (profile && user) {
      form.reset({
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: user.email || "",
        is_admin: profile.is_admin || false,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profile, user, form]);

  if (isLoadingProfile) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const handleProfileSubmit: SubmitHandler<z.infer<typeof profileSettingsFormSchema>> = (values) => {
    const [first_name, ...last_name_parts] = values.name.split(' ');
    const last_name = last_name_parts.join(' ');
    updateProfileMutation.mutate({ first_name, last_name, is_admin: values.is_admin });
  };

  const handlePasswordSubmit: SubmitHandler<z.infer<typeof profileSettingsFormSchema>> = (values) => {
    if (values.newPassword) {
      updatePasswordMutation.mutate(values.newPassword);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={displayAvatar || undefined} alt="User Avatar" />
            <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
          </Avatar>
          <Button variant="outline">Change Avatar</Button>
        </CardHeader>
      </Card>
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email address" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.id === 'df02bbc5-167b-4a8c-a3f8-de0eb4d9db47' && ( // Admin check
                  <FormField
                    control={form.control}
                    name="is_admin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Admin Access</FormLabel>
                          <FormDescription>
                            Toggle your administrative privileges.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </Form>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel> {/* Corrected closing tag */}
                      <FormControl>
                        <Input type="password" placeholder="New password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main Settings Page Component ---
const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'user-management';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const tabItems = [
    { label: <span className="flex items-center"><Users className="mr-2 h-4 w-4" />User Management</span>, value: 'user-management', content: <UserManagement /> },
    { label: <span className="flex items-center"><Wrench className="mr-2 h-4 w-4" />Service & SLA</span>, value: 'service-sla', content: <ServiceSlaManagement /> }, // Removed duplicate '/>'
    { label: <span className="flex items-center"><SettingsIcon className="mr-2 h-4 w-4" />System Settings</span>, value: 'system-settings', content: <SystemSettings /> },
    { label: <span className="flex items-center"><User className="mr-2 h-4 w-4" />My Profile</span>, value: 'profile-settings', content: <ProfileSettings /> },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <Breadcrumbs />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabItems.map(item => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map(item => (
          <TabsContent key={item.value} value={item.value} className="mt-6">
            {item.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SettingsPage;