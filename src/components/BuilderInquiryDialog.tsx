import React, { useState } from 'react';
import { Phone, Send, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const unitOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Penthouse', 'Shop'];

interface BuilderInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  builderUserId: string;
  source?: string;
}

const BuilderInquiryDialog = ({ open, onOpenChange, projectName, builderUserId, source = 'website' }: BuilderInquiryDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', budget: '', unitType: '', message: '' });

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast({ title: 'Required', description: 'Please enter name and phone number', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('builder_inquiries').insert({
      builder_user_id: builderUserId,
      project_name: projectName,
      name: form.name,
      phone: form.phone,
      budget: form.budget || null,
      unit_type: form.unitType || null,
      message: form.message || null,
      source,
    } as any);

    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: 'Could not send enquiry. Try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Enquiry Sent!', description: `Your enquiry for ${projectName} has been sent to the builder.` });
      setForm({ name: '', phone: '', budget: '', unitType: '', message: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Enquire — {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Your Name *</Label>
            <Input placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Phone *</Label>
            <Input placeholder="+91 98765..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Budget</Label>
            <Input placeholder="e.g. ₹50L - ₹75L" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Interested In</Label>
            <div className="flex flex-wrap gap-1.5">
              {unitOptions.map(u => (
                <Badge
                  key={u}
                  variant={form.unitType === u ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setForm(p => ({ ...p, unitType: p.unitType === u ? '' : u }))}
                >
                  {u}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Message (optional)</Label>
            <textarea
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any specific requirements..."
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Sending...' : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Enquiry
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuilderInquiryDialog;
