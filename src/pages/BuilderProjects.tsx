import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, ArrowLeft, MapPin, Eye, Phone, MousePointerClick,
  Share2, Edit2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useBuilderProjects } from '@/hooks/use-builder-projects';
import { Skeleton } from '@/components/ui/skeleton';

const BuilderProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { projects, loading, deleteProject } = useBuilderProjects();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await deleteProject(id);
    if (!error) toast({ title: 'Project removed' });
    else toast({ title: 'Error', description: 'Failed to remove project', variant: 'destructive' });
  };

  const handleShare = async (project: any) => {
    const text = `${project.name} - ${project.price_range || ''} at ${project.location}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard' });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-background to-orange-50/50 pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-lg">My Projects</h1>
              <p className="text-xs text-muted-foreground">{projects.length} projects listed</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/builder-list-project')}>
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-bold text-foreground text-lg">No Projects Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Start by listing your first builder project</p>
            <Button onClick={() => navigate('/builder-list-project')}>
              <Plus className="h-4 w-4 mr-1" /> List New Project
            </Button>
          </div>
        ) : (
          projects.map(project => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex cursor-pointer" onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}>
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.name} className="w-28 h-32 object-cover" />
                  ) : (
                    <div className="w-28 h-32 bg-muted flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-foreground text-sm">{project.name}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${
                        project.status === 'Near Completion' ? 'border-emerald-500/30 text-emerald-600' :
                        project.status === 'Pre-Launch' ? 'border-purple-500/30 text-purple-600' :
                        'border-primary/30 text-primary'
                      }`}>{project.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" /><span>{project.location}</span>
                    </div>
                    <p className="text-xs text-primary font-semibold mt-1">{project.price_range || 'Price TBD'}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{project.sold_units}/{project.total_units} units sold</span>
                        <span>{project.completion_percent}% built</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(project.sold_units / Math.max(project.total_units, 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {expandedProject === project.id && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-semibold text-foreground mb-2">Project Performance</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        <Eye className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.views.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                        <MousePointerClick className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.clicks}</p>
                        <p className="text-[10px] text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                        <Phone className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{project.inquiries}</p>
                        <p className="text-[10px] text-muted-foreground">Inquiries</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => handleShare(project)}>
                        <Share2 className="h-3 w-3 mr-1" /> Share
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => navigate('/builder-list-project')}>
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderProjects;
