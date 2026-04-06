import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Rental {
  id: string;
  propertyName: string;
  city: string;
  state: string;
  rentAmount: number;
  dueDate: string;
  dueTime: string;
  phoneNumber: string;
  status: "paid" | "pending";
  lastPaid?: string;
}

export const useRentals = () => {
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);

  // Load rentals from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("rentTracker");
    if (stored) {
      setRentals(JSON.parse(stored));
    }
  }, []);

  // Save rentals to localStorage whenever they change
  useEffect(() => {
    if (rentals.length >= 0) {
      localStorage.setItem("rentTracker", JSON.stringify(rentals));
    }
  }, [rentals]);

  const addRental = (rental: Omit<Rental, "id" | "status">) => {
    const newRental: Rental = {
      ...rental,
      id: Date.now().toString(),
      status: "pending"
    };
    setRentals([...rentals, newRental]);
    return newRental;
  };

  const updateRental = (id: string, updates: Partial<Rental>) => {
    setRentals(rentals.map(rental => 
      rental.id === id ? { ...rental, ...updates } : rental
    ));
  };

  const deleteRental = (id: string) => {
    setRentals(rentals.filter(rental => rental.id !== id));
  };

  const markAsPaid = (id: string) => {
    setRentals(rentals.map(rental => 
      rental.id === id 
        ? { ...rental, status: "paid" as const, lastPaid: new Date().toISOString().split('T')[0] }
        : rental
    ));
  };

  const checkDueNotifications = () => {
    const today = new Date();
    
    rentals.forEach(rental => {
      if (rental.status === "pending") {
        const dueDateTime = new Date(rental.dueDate + "T" + rental.dueTime);
        const daysUntilDue = Math.ceil((dueDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          toast({
            title: "📢 Rent Due Soon",
            description: `${rental.propertyName} rent is due in ${daysUntilDue} day(s). Contact: ${rental.phoneNumber}`,
            duration: 6000,
          });
        } else if (daysUntilDue < 0) {
          toast({
            title: "⚠️ Rent Overdue",
            description: `${rental.propertyName} rent is overdue! Contact: ${rental.phoneNumber}`,
            duration: 6000,
          });
        }
      }
    });
  };

  const getRentalStats = () => {
    const totalRent = rentals.reduce((sum, rental) => sum + rental.rentAmount, 0);
    const pendingRent = rentals.filter(r => r.status === "pending").reduce((sum, rental) => sum + rental.rentAmount, 0);
    const totalProperties = rentals.length;
    const pendingProperties = rentals.filter(r => r.status === "pending").length;

    return {
      totalRent,
      pendingRent,
      totalProperties,
      pendingProperties
    };
  };

  const getDueRentals = () => {
    const today = new Date();
    return rentals.filter(rental => {
      if (rental.status !== "pending") return false;
      const dueDateTime = new Date(rental.dueDate + "T" + rental.dueTime);
      const daysUntilDue = Math.ceil((dueDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7; // Due within next 7 days
    });
  };

  return {
    rentals,
    addRental,
    updateRental,
    deleteRental,
    markAsPaid,
    checkDueNotifications,
    getRentalStats,
    getDueRentals
  };
};
