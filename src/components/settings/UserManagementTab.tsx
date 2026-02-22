import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Users,
    Shield,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Check,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ROLE_LABELS,
    UserRole,
    hasCmmsAccess,
    hasTicketingAccess
} from '@/types/ticketing';
import { showSuccess, showError } from '@/utils/toast';

const UserManagementTab = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        role: UserRole;
        has_cmms_access: boolean;
        has_ticketing_access: boolean;
    } | null>(null);

    // Fetch all profiles
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('first_name');
            if (error) throw error;
            return data || [];
        }
    });

    const updateProfile = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
            showSuccess('User updated successfully');
            setEditingUserId(null);
            setEditForm(null);
        },
        onError: (err: any) => {
            showError(err.message || 'Failed to update user');
        }
    });

    const filteredUsers = users.filter(u =>
        u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEditStart = (user: any) => {
        setEditingUserId(user.id);
        setEditForm({
            role: (user.role as UserRole) || 'maintenance_technician',
            has_cmms_access: user.has_cmms_access ?? true,
            has_ticketing_access: user.has_ticketing_access ?? false,
        });
    };

    const handleSave = () => {
        if (!editingUserId || !editForm) return;
        updateProfile.mutate({
            id: editingUserId,
            updates: {
                role: editForm.role,
                has_cmms_access: editForm.has_cmms_access,
                has_ticketing_access: editForm.has_ticketing_access,
                // Automatically sync is_admin if they are system_admin
                is_admin: editForm.role === 'system_admin'
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground">Manage user roles and system access permissions.</p>
                </div>
                {/* <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite User
                </Button> */}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">CMMS Access</TableHead>
                                <TableHead className="text-center">Ticketing Access</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">No users found.</TableCell>
                                </TableRow>
                            ) : filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.first_name} {user.last_name}</span>
                                            {/* <span className="text-xs text-muted-foreground">Email placeholder</span> */}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {editingUserId === user.id ? (
                                            <select
                                                className="w-full text-sm rounded-md border border-input bg-background p-1"
                                                value={editForm?.role}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, role: e.target.value as UserRole } : null)}
                                            >
                                                {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                                    <option key={val} value={val}>{label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm">{ROLE_LABELS[user.role as UserRole] || 'No Role'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {editingUserId === user.id ? (
                                            <input
                                                type="checkbox"
                                                checked={editForm?.has_cmms_access}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, has_cmms_access: e.target.checked } : null)}
                                            />
                                        ) : (
                                            hasCmmsAccess(user.role) ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                            )
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {editingUserId === user.id ? (
                                            <input
                                                type="checkbox"
                                                checked={editForm?.has_ticketing_access}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, has_ticketing_access: e.target.checked } : null)}
                                            />
                                        ) : (
                                            hasTicketingAccess(user.role) ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                            )
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingUserId === user.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={handleSave}>
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { setEditingUserId(null); setEditForm(null); }}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditStart(user)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagementTab;
