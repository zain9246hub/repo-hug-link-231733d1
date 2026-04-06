import { useState, useEffect } from "react";
import { Home, Calendar, IndianRupee, CheckCircle, Clock, Plus, Trash2, Edit, ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES, getCitiesByState } from "@/data/locations";
import { useRentals, Rental } from "@/hooks/use-rentals";

const RentTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    rentals, 
    addRental, 
    updateRental, 
    deleteRental, 
    markAsPaid,
    checkDueNotifications,
    getRentalStats 
  } = useRentals();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [editSelectedState, setEditSelectedState] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [editCities, setEditCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    propertyName: "",
    city: "",
    state: "",
    rentAmount: "",
    dueDate: "",
    dueTime: "",
    phoneNumber: ""
  });

  // Check due notifications on mount
  useEffect(() => {
    checkDueNotifications();
  }, []);

  // Update cities when state changes (for add form)
  useEffect(() => {
    if (selectedState) {
      setCities(getCitiesByState(selectedState));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // Update cities when edit state changes
  useEffect(() => {
    if (editSelectedState) {
      setEditCities(getCitiesByState(editSelectedState));
    } else {
      setEditCities([]);
    }
  }, [editSelectedState]);

  const handleAddProperty = () => {
    if (!formData.propertyName || !formData.rentAmount || !formData.dueDate || 
        !formData.dueTime || !formData.city || !formData.state || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    addRental({
      propertyName: formData.propertyName,
      city: formData.city,
      state: formData.state,
      rentAmount: parseFloat(formData.rentAmount),
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      phoneNumber: formData.phoneNumber
    });
    setFormData({ propertyName: "", city: "", state: "", rentAmount: "", dueDate: "", dueTime: "", phoneNumber: "" });
    setSelectedState("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Property added to rent tracker"
    });
  };

  const handleUpdateProperty = () => {
    if (!editingRental || !formData.propertyName || !formData.rentAmount || !formData.dueDate || 
        !formData.dueTime || !formData.city || !formData.state || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    updateRental(editingRental.id, {
      propertyName: formData.propertyName,
      city: formData.city,
      state: formData.state,
      rentAmount: parseFloat(formData.rentAmount),
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      phoneNumber: formData.phoneNumber
    });
    
    setFormData({ propertyName: "", city: "", state: "", rentAmount: "", dueDate: "", dueTime: "", phoneNumber: "" });
    setEditingRental(null);
    setEditSelectedState("");
    
    toast({
      title: "Success",
      description: "Property updated successfully"
    });
  };

  const handleDeleteProperty = (id: string) => {
    deleteRental(id);
    toast({
      title: "Success",
      description: "Property removed from tracker"
    });
  };

  const handleMarkAsPaid = (id: string) => {
    markAsPaid(id);
    toast({
      title: "Payment Recorded",
      description: "Rent payment marked as paid"
    });
  };

  const handleEditClick = (rental: Rental) => {
    setEditingRental(rental);
    setEditSelectedState(rental.state);
    setFormData({
      propertyName: rental.propertyName,
      city: rental.city,
      state: rental.state,
      rentAmount: rental.rentAmount.toString(),
      dueDate: rental.dueDate,
      dueTime: rental.dueTime,
      phoneNumber: rental.phoneNumber
    });
  };

  const { totalRent, pendingRent } = getRentalStats();

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Home className="h-8 w-8 text-primary" />
          Rent Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your rental properties and track payments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold text-foreground">{rentals.length}</p>
              </div>
              <Home className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Rent</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRent.toLocaleString('en-IN')}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹{pendingRent.toLocaleString('en-IN')}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Property Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Property to Rent Tracker</DialogTitle>
            <DialogDescription>
              Enter the details of the rental property you want to track
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input 
                id="propertyName"
                placeholder="e.g., 2BHK Apartment, Bandra"
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select 
                  value={formData.state || selectedState} 
                  onValueChange={(value) => {
                    setSelectedState(value);
                    setFormData({ ...formData, state: value, city: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  disabled={!selectedState && !formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Tenant Phone Number</Label>
              <Input 
                id="phoneNumber"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent (₹)</Label>
              <Input 
                id="rentAmount"
                type="number"
                placeholder="45000"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Payment Due Date</Label>
                <Input 
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input 
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setFormData({ propertyName: "", city: "", state: "", rentAmount: "", dueDate: "", dueTime: "", phoneNumber: "" });
              setSelectedState("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddProperty}>Add Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={!!editingRental} onOpenChange={(open) => {
        if (!open) {
          setEditingRental(null);
          setFormData({ propertyName: "", city: "", state: "", rentAmount: "", dueDate: "", dueTime: "", phoneNumber: "" });
          setEditSelectedState("");
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the details of your rental property
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-propertyName">Property Name</Label>
              <Input 
                id="edit-propertyName"
                placeholder="e.g., 2BHK Apartment, Bandra"
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Select 
                  value={formData.state || editSelectedState} 
                  onValueChange={(value) => {
                    setEditSelectedState(value);
                    setFormData({ ...formData, state: value, city: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  disabled={!editSelectedState && !formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {editCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Tenant Phone Number</Label>
              <Input 
                id="edit-phoneNumber"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rentAmount">Monthly Rent (₹)</Label>
              <Input 
                id="edit-rentAmount"
                type="number"
                placeholder="45000"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Payment Due Date</Label>
                <Input 
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueTime">Due Time</Label>
                <Input 
                  id="edit-dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingRental(null);
              setFormData({ propertyName: "", city: "", state: "", rentAmount: "", dueDate: "", dueTime: "", phoneNumber: "" });
              setEditSelectedState("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProperty}>Update Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rental Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rental Properties</CardTitle>
          <CardDescription>
            Track and manage rent payments for all your properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rentals.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No properties added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Property" to start tracking</p>
            </div>
          ) : (
            rentals.map((rental) => (
              <div key={rental.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{rental.propertyName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{rental.city}, {rental.state}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <IndianRupee className="h-3 w-3" />
                      <span className="font-medium text-foreground">₹{rental.rentAmount.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="text-muted-foreground">per month</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    rental.status === 'paid' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {rental.status === 'paid' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span className="capitalize">{rental.status}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="text-foreground">{rental.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Due: <span className="font-medium text-foreground">{new Date(rental.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {rental.dueTime}</span></span>
                  </div>
                  {rental.status === 'paid' && rental.lastPaid && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      <span>Last paid: <span className="text-foreground">{new Date(rental.lastPaid).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  {rental.status === "pending" && (
                    <Button size="sm" onClick={() => handleMarkAsPaid(rental.id)} className="flex-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark as Paid
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(rental)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteProperty(rental.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentTracker;
