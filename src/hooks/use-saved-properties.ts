import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface SavedProperty {
  id: string;
  property_id: string;
  created_at: string;
}

export function useSavedProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) {
      setSavedProperties([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedProperties(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [user?.id]);

  const isSaved = (propertyId: string) => {
    return savedProperties.some(sp => sp.property_id === propertyId);
  };

  const toggleSave = async (propertyId: string) => {
    if (!user) {
      toast({ title: 'Please login to save properties', variant: 'destructive' });
      return;
    }

    if (isSaved(propertyId)) {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (!error) {
        setSavedProperties(prev => prev.filter(sp => sp.property_id !== propertyId));
        toast({ title: 'Property removed from saved' });
      }
    } else {
      const { data, error } = await supabase
        .from('saved_properties')
        .insert({ user_id: user.id, property_id: propertyId })
        .select()
        .single();

      if (!error && data) {
        setSavedProperties(prev => [data, ...prev]);
        toast({ title: 'Property saved!' });
      }
    }
  };

  return { savedProperties, loading, isSaved, toggleSave, refetch: fetchSaved };
}
