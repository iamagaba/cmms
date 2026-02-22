
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Loader2 } from 'lucide-react';

const ProfileTab = () => {
    const { session } = useSession();
    const user = session?.user;
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery<Profile | null>({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
        },
    });

    // Update form values when profile data loads
    React.useEffect(() => {
        if (profile) {
            reset({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
            });
        }
    }, [profile, reset]);

    const updateProfileMutation = useMutation({
        mutationFn: async (updates: { first_name?: string; last_name?: string }) => {
            if (!user?.id) throw new Error("User not authenticated.");
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, ...updates });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            showSuccess('Profile updated.');
        },
        onError: (error: any) => {
            showError(error.message || 'Failed to update profile');
        },
    });

    const onSubmit = (data: any) => {
        updateProfileMutation.mutate(data);
    };

    const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="h-32 pt-6">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {displayAvatar ? (
                                <img
                                    src={displayAvatar}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-2 border-border object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-semibold text-foreground">
                                {profile?.first_name} {profile?.last_name || user?.email}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user?.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={profile?.is_admin ? 'default' : 'secondary'}>
                                    {profile?.is_admin ? 'Administrator' : 'User'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    {...register('first_name')}
                                    placeholder="First name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    {...register('last_name')}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileTab;
