import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Ban, Trash2, UserCheck, ShieldAlert, Users } from "lucide-react";

interface UserAccount {
  id: string;
  user_id: string;
  full_name: string | null;
  user_type: string;
  is_active: boolean;
  created_at: string;
  email?: string;
}

const AccountManagement = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "suspend" | "activate" | "delete";
    account: UserAccount | null;
  }>({ open: false, action: "suspend", account: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, user_type, is_active, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (account: UserAccount) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", account.id);

      if (error) throw error;
      toast.success(`${account.full_name || "User"} has been suspended`);
      fetchAccounts();
    } catch (err) {
      console.error("Error suspending account:", err);
      toast.error("Failed to suspend account");
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "suspend", account: null });
    }
  };

  const handleActivate = async (account: UserAccount) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: true })
        .eq("id", account.id);

      if (error) throw error;
      toast.success(`${account.full_name || "User"} has been reactivated`);
      fetchAccounts();
    } catch (err) {
      console.error("Error activating account:", err);
      toast.error("Failed to activate account");
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "activate", account: null });
    }
  };

  const handleDelete = async (account: UserAccount) => {
    setActionLoading(true);
    try {
      // Delete related data based on user type
      if (account.user_type === "broker") {
        // Delete broker clients, notifications, inquiries, reviews, then broker record
        const { data: broker } = await supabase
          .from("brokers")
          .select("id")
          .eq("user_id", account.user_id)
          .maybeSingle();

        if (broker) {
          await supabase.from("broker_clients").delete().eq("broker_id", broker.id);
          await supabase.from("broker_notifications").delete().eq("broker_id", broker.id);
          await supabase.from("broker_inquiries").delete().eq("broker_id", broker.id);
          await supabase.from("broker_reviews").delete().eq("broker_id", broker.id);
          await supabase.from("brokers").delete().eq("id", broker.id);
        }
      } else if (account.user_type === "builder") {
        await supabase.from("builder_inquiries").delete().eq("builder_user_id", account.user_id);
        await supabase.from("builder_projects").delete().eq("user_id", account.user_id);
      }

      // Delete user's properties
      await supabase.from("properties").delete().eq("user_id", account.user_id);

      // Delete subscriptions
      await supabase.from("subscriptions").delete().eq("user_id", account.user_id);

      // Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", account.id);

      if (error) throw error;
      toast.success(`${account.full_name || "User"} account has been removed`);
      fetchAccounts();
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to remove account. Some related data may require manual cleanup.");
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "delete", account: null });
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.account) return;
    switch (confirmDialog.action) {
      case "suspend":
        handleSuspend(confirmDialog.account);
        break;
      case "activate":
        handleActivate(confirmDialog.account);
        break;
      case "delete":
        handleDelete(confirmDialog.account);
        break;
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      !search ||
      (a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      a.user_type.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || a.user_type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && a.is_active) ||
      (filterStatus === "suspended" && !a.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      broker: "bg-blue-500/10 text-blue-600 border-blue-200",
      builder: "bg-amber-500/10 text-amber-600 border-amber-200",
      owner: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      buyer: "bg-purple-500/10 text-purple-600 border-purple-200",
    };
    return (
      <Badge variant="outline" className={variants[type] || ""}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "destructive"}>
      {isActive ? "Active" : "Suspended"}
    </Badge>
  );

  const dialogMessages = {
    suspend: {
      title: "Suspend Account",
      description: "This will prevent the user from accessing their account. Their listings and data will be preserved.",
      buttonText: "Suspend",
      variant: "destructive" as const,
    },
    activate: {
      title: "Reactivate Account",
      description: "This will restore full access to the user's account.",
      buttonText: "Reactivate",
      variant: "default" as const,
    },
    delete: {
      title: "Remove Account",
      description: "This will permanently delete the user's profile, listings, and all related data. This action cannot be undone.",
      buttonText: "Remove Permanently",
      variant: "destructive" as const,
    },
  };

  const currentDialog = confirmDialog.action ? dialogMessages[confirmDialog.action] : dialogMessages.suspend;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription>
                Manage user accounts — suspend or remove brokers, owners, builders
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              {accounts.filter((a) => !a.is_active).length} suspended
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
                <SelectItem value="builder">Builder</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No accounts found matching your filters.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.full_name || "Unnamed User"}
                      </TableCell>
                      <TableCell>{getTypeBadge(account.user_type)}</TableCell>
                      <TableCell>{getStatusBadge(account.is_active)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(account.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {account.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() =>
                                setConfirmDialog({ open: true, action: "suspend", account })
                              }
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() =>
                                setConfirmDialog({ open: true, action: "activate", account })
                              }
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() =>
                              setConfirmDialog({ open: true, action: "delete", account })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, action: "suspend", account: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDialog.title}</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">
                {confirmDialog.account?.full_name || "Unnamed User"}
              </span>{" "}
              ({confirmDialog.account?.user_type})
              <br />
              <br />
              {currentDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, action: "suspend", account: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={currentDialog.variant}
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {currentDialog.buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountManagement;
