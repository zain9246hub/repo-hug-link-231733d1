import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export interface BuilderProject {
  id: string;
  user_id: string;
  name: string;
  location: string;
  city: string;
  total_units: number;
  sold_units: number;
  status: string;
  image_url: string | null;
  completion_percent: number;
  price_range: string | null;
  rera_number: string | null;
  description: string;
  contact_phone: string | null;
  contact_email: string | null;
  unit_types: string[];
  amenities: string[];
  completion_date: string | null;
  views: number;
  clicks: number;
  inquiries: number;
  created_at: string;
  updated_at: string;
}

export function useBuilderProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching builder projects:', error);
      setProjects([]);
    } else {
      setProjects((data as BuilderProject[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('builder_projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
    return { error };
  };

  return { projects, loading, refetch: fetchProjects, deleteProject };
}
