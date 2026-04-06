import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AdCustomer } from "@/pages/Admin";

interface CustomerManagementProps {
  customers: AdCustomer[];
  onRefresh: () => void;
}

const CustomerManagement = ({ customers, onRefresh }: CustomerManagementProps) => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<AdCustomer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleStatusChange = async (customerId: string, newStatus: string) => {
    const { error } = await supabase.from('ad_customers').update({ status: newStatus, updated_at: new Date().toISOString() } as any).eq('id', customerId);
    if (error) { console.error('Customer status error:', error); toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' }); }
    else onRefresh();
  };

  const handleDeleteCustomer = async (customerId: string) => {
    const { error } = await supabase.from('ad_customers').delete().eq('id', customerId);
    if (error) { console.error('Customer delete error:', error); toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' }); }
    else { toast({ title: 'Customer Deleted' }); onRefresh(); }
  };

  const CustomerForm = ({ customer, onSubmit, onCancel }: {
    customer?: AdCustomer;
    onSubmit: (formData: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      company: customer?.company || "",
      notes: customer?.notes || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="premium">{customer ? "Update Customer" : "Add Customer"}</Button>
        </div>
      </form>
    );
  };

  const handleCreate = async (formData: any) => {
    const { error } = await supabase.from('ad_customers').insert(formData as any);
    if (error) { console.error('Customer create error:', error); toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' }); }
    else { toast({ title: 'Customer Added!' }); setIsCreateModalOpen(false); onRefresh(); }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedCustomer) return;
    const { error } = await supabase.from('ad_customers').update({ ...formData, updated_at: new Date().toISOString() } as any).eq('id', selectedCustomer.id);
    if (error) { console.error('Customer update error:', error); toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' }); }
    else { toast({ title: 'Customer Updated!' }); setIsEditModalOpen(false); setSelectedCustomer(null); onRefresh(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Customer Management
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="premium" size="sm" className="gap-2"><Plus className="h-4 w-4" />Add Customer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Add a new customer to the advertising platform</DialogDescription>
              </DialogHeader>
              <CustomerForm onSubmit={handleCreate} onCancel={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Manage customer accounts, track spending, and monitor activity</CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No customers yet. Add your first customer above.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Ads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{customer.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="font-medium">{customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm"><Mail className="h-3 w-3 text-muted-foreground" /><span>{customer.email}</span></div>
                      <div className="flex items-center space-x-1 text-sm"><Phone className="h-3 w-3 text-muted-foreground" /><span>{customer.phone}</span></div>
                    </div>
                  </TableCell>
                  <TableCell><div className="flex items-center space-x-1"><Building className="h-4 w-4 text-muted-foreground" /><span>{customer.company}</span></div></TableCell>
                  <TableCell>
                    <Select value={customer.status} onValueChange={(v) => handleStatusChange(customer.id, v)}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>₹{customer.total_spent.toLocaleString()}</TableCell>
                  <TableCell>{customer.ads_count}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div><Label className="text-sm font-medium">Name</Label><p className="text-sm text-muted-foreground">{customer.name}</p></div>
                              <div><Label className="text-sm font-medium">Company</Label><p className="text-sm text-muted-foreground">{customer.company}</p></div>
                              <div><Label className="text-sm font-medium">Email</Label><p className="text-sm text-muted-foreground">{customer.email}</p></div>
                              <div><Label className="text-sm font-medium">Phone</Label><p className="text-sm text-muted-foreground">{customer.phone}</p></div>
                            </div>
                            {customer.notes && (<div><Label className="text-sm font-medium">Notes</Label><p className="text-sm text-muted-foreground">{customer.notes}</p></div>)}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isEditModalOpen && selectedCustomer?.id === customer.id} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setSelectedCustomer(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCustomer(customer)}><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader><DialogTitle>Edit Customer</DialogTitle><DialogDescription>Update customer information</DialogDescription></DialogHeader>
                          {selectedCustomer && <CustomerForm customer={selectedCustomer} onSubmit={handleUpdate} onCancel={() => { setIsEditModalOpen(false); setSelectedCustomer(null); }} />}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCustomer(customer.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerManagement;
