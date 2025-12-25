import { useSession } from '@/context/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button, Card, Typography } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccess, showError } from '@/utils/toast';
import { Icon } from '@iconify/react';

const { Paragraph } = Typography;

const DEVELOPER_EMAIL = 'bbyarugaba@bodawerk.co.ug';

const DeveloperSuperAdmin = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const user = session?.user;

  const updateUserMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!user || !session?.access_token) throw new Error('User not found or not authenticated');
      
      console.log('Attempting to call Edge Function with:', {
        userId: user.id,
        role,
        hasToken: !!session.access_token
      });
      
      try {
        const { data, error } = await supabase.functions.invoke('user-management', {
          method: 'PUT',
          body: { id: user.id, role },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        
        console.log('Edge Function response:', { data, error });
        
        if (error) {
          console.error('Edge Function error details:', error);
          throw new Error(`Edge Function error (${error.status || 'unknown status'}): ${error.message || JSON.stringify(error)}`);
        }
        return data;
      } catch (err) {
        console.error('Full error details:', err);
        throw err;
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      // Refresh the user session to get the updated role
      try {
        await supabase.auth.refreshSession();
        showSuccess('Super Admin access granted! Your session has been refreshed.');
        // Refresh the page to ensure all components update with the new role
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch {
        showSuccess('Super Admin access granted! Please refresh the page to see all changes.');
      }
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      showError(`Failed to grant access: ${error.message}`);
    },
  });

  if (user?.email !== DEVELOPER_EMAIL) {
    return null;
  }

  const handleGrantAccess = () => {
    updateUserMutation.mutate('superadmin');
  };

  const isSuperAdmin = user?.user_metadata?.role === 'superadmin';

  return (
    <Card title="Developer Zone" style={{ marginTop: 24 }}>
      <Paragraph>
        This section is for the system developer.
      </Paragraph>
      <Button
        type="primary"
        danger
        icon={<Icon icon="ph:crown-simple-fill" />}
        onClick={handleGrantAccess}
        loading={updateUserMutation.isPending}
        disabled={isSuperAdmin}
      >
        {isSuperAdmin ? 'Super Admin Access Granted' : 'Grant Super Admin Access'}
      </Button>
    </Card>
  );
};

export default DeveloperSuperAdmin;
