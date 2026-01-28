import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, Mail, MapPin, Circle, Clipboard, Wrench, Plus, Save, Check, X } from 'lucide-react';
import { Technician, Location } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const technicianSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    status: z.enum(['available', 'busy', 'offline']),
    location_id: z.string().optional(),
    max_concurrent_orders: z.coerce.number().min(1, 'Must be at least 1').max(20, 'Max 20 concurrent orders'),
    specializations: z.array(z.string()).default([]),
});

type TechnicianFormValues = z.infer<typeof technicianSchema>;

interface TechnicianFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Technician>) => void;
    technician?: Technician | null;
    locations: Location[];
}

export const TechnicianFormDrawer: React.FC<TechnicianFormDrawerProps> = ({
    isOpen,
    onClose,
    onSubmit,
    technician,
    locations
}) => {
    const form = useForm<TechnicianFormValues>({
        resolver: zodResolver(technicianSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            status: 'available',
            location_id: '',
            max_concurrent_orders: 5,
            specializations: [],
        },
    });

    const { reset, setValue, watch } = form;
    const specializations = watch('specializations');
    const [newSkill, setNewSkill] = React.useState('');

    useEffect(() => {
        if (isOpen) {
            if (technician) {
                reset({
                    name: technician.name || '',
                    email: technician.email || '',
                    phone: technician.phone || '',
                    status: (technician.status as 'available' | 'busy' | 'offline') || 'available',
                    location_id: technician.location_id || '',
                    max_concurrent_orders: technician.max_concurrent_orders || 5,
                    specializations: technician.specializations || [],
                });
            } else {
                reset({
                    name: '',
                    email: '',
                    phone: '',
                    status: 'available',
                    location_id: '',
                    max_concurrent_orders: 5,
                    specializations: [],
                });
            }
        }
    }, [technician, isOpen, reset]);

    const handleFormSubmit = (data: TechnicianFormValues) => {
        const submissionData: Partial<Technician> = {
            ...data,
            id: technician?.id, // Preserve ID for updates
        };
        onSubmit(submissionData);
        // Do not close here, let parent handle it or keep it open for errors? 
        // Parent usually closes on success.
    };

    const addSkill = () => {
        if (newSkill.trim() && !specializations.includes(newSkill.trim())) {
            setValue('specializations', [...specializations, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setValue(
            'specializations',
            specializations.filter((skill) => skill !== skillToRemove)
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{technician ? 'Edit Technician' : 'Add Technician'}</SheetTitle>
                    <SheetDescription>
                        {technician
                            ? 'Update technician information and assignments.'
                            : 'Create technician profile to assign work orders.'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 mt-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                                <Input {...field} className="pl-9" placeholder="Enter technician name" />
                                            </div>
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
                                            <div className="relative">
                                                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                                <Input {...field} className="pl-9" placeholder="technician@example.com" type="email" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                                <Input {...field} className="pl-9" placeholder="+256 XXX XXX XXX" type="tel" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assignment Details</h3>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <div className="flex items-center gap-2">
                                                        <Circle className="w-4 h-4 text-muted-foreground" />
                                                        <SelectValue placeholder="Select status" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="busy">Busy</SelectItem>
                                                <SelectItem value="offline">Offline</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                                        <SelectValue placeholder="Select a location" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locations.map((loc) => (
                                                    <SelectItem key={loc.id} value={loc.id}>
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="max_concurrent_orders"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Concurrent Work Orders</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clipboard className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                                <Input {...field} className="pl-9" type="number" min={1} max={20} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of work orders this technician can handle simultaneously.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Specializations & Skills</h3>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Wrench className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                        className="pl-9"
                                        placeholder="Add a specialization (e.g., Electrical)"
                                    />
                                </div>
                                <Button type="button" size="sm" onClick={addSkill} className="shrink-0">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-muted/30 rounded-lg border border-dashed">
                                {specializations.length > 0 ? (
                                    specializations.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                            <Check className="w-3 h-3 text-primary" />
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="ml-1 hover:text-destructive transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <div className="w-full text-center text-muted-foreground text-sm flex flex-col items-center justify-center py-2">
                                        <p>No specializations added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <SheetFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Save className="w-4 h-4 mr-1.5" />
                                {technician ? 'Update Technician' : 'Create Technician'}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};


