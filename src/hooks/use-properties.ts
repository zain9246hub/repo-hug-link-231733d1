import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export interface Property {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  price: string;
  image_url: string | null;
  bedrooms: number;
  bathrooms: number;
  area: string;
  property_type: string;
  listing_type: string;
  posted_by: string;
  phone: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_urgent: boolean;
  urgency_level: string | null;
  days_left: number | null;
  original_price: string | null;
  price_reduction: number | null;
  furnishing: string | null;
  deposit: string | null;
  available_from: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useProperties(filters?: {
  city?: string;
  area?: string;
  property_type?: string;
  listing_type?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  user_id?: string;
  withCoordinates?: boolean;
  status?: string;
  limit?: number;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);

    // If user-specific or advanced filters are needed, use direct table query (authenticated)
    const needsDirectQuery = filters?.user_id || filters?.area || filters?.property_type || filters?.listing_type || 
      filters?.is_featured || filters?.is_urgent || filters?.withCoordinates || filters?.status;

    let data: any[] | null = null;
    let error: any = null;

    if (needsDirectQuery) {
      let query = supabase.from('properties').select('id,user_id,title,description,location,city,price,image_url,bedrooms,bathrooms,area,property_type,listing_type,posted_by,phone,is_verified,is_featured,is_urgent,urgency_level,days_left,original_price,price_reduction,furnishing,deposit,available_from,latitude,longitude,status,created_at,updated_at');

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.area) {
        query = query.or(`area.ilike.%${filters.area}%,location.ilike.%${filters.area}%`);
      }
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters?.listing_type) {
        query = query.eq('listing_type', filters.listing_type);
      }
      if (filters?.is_featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.is_urgent) {
        query = query.eq('is_urgent', true);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.withCoordinates) {
        query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false }).limit(filters?.limit || 50);
      const result = await query;
      data = result.data;
      error = result.error;
    } else {
      // Use RPC that masks phone for anonymous users
      const result = await supabase.rpc('get_published_properties', {
        _city: filters?.city || null,
        _limit: filters?.limit || 50,
      });
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } else {
      setProperties((data as Property[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [JSON.stringify(filters)]);

  return { properties, loading, refetch: fetchProperties };
}

export function useMyProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProperties = async () => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my properties:', error);
      setProperties([]);
    } else {
      setProperties((data as Property[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyProperties();
  }, [user?.id]);

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
    return { error };
  };

  const renewProperty = async (id: string) => {
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('properties')
      .update({ updated_at: newExpiry, status: 'published' })
      .eq('id', id);
    if (!error) {
      await fetchMyProperties();
    }
    return { error };
  };

  return { properties, loading, refetch: fetchMyProperties, deleteProperty, renewProperty };
}
