import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
    id: string;
    name: string;
    address: string | null;
    status: 'active' | 'inactive';
}

export function useLocations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchLocations() {
            try {
                const { data, error } = await supabase
                    .from('locations')
                    .select('*')
                    .eq('status', 'active')
                    .order('name');

                if (error) throw error;

                setLocations(data || []);
            } catch (err) {
                console.error('Error fetching locations:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
            } finally {
                setLoading(false);
            }
        }

        fetchLocations();
    }, []);

    return { locations, loading, error };
}
