import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

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
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const mapRow = (row: any): Rental => ({
    id: row.id,
    propertyName: row.property_name,
    city: row.city,
    state: row.state,
    rentAmount: Number(row.rent_amount),
    dueDate: row.due_date,
    dueTime: row.due_time,
    phoneNumber: row.phone_number,
    status: row.status as "paid" | "pending",
    lastPaid: row.last_paid || undefined,
  });

  const fetchRentals = useCallback(async () => {
    if (!user) { setRentals([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (!error && data) {
      setRentals(data.map(mapRow));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchRentals(); }, [fetchRentals]);

  const addRental = async (rental: Omit<Rental, "id" | "status">) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        user_id: user.id,
        property_name: rental.propertyName,
        city: rental.city,
        state: rental.state,
        rent_amount: rental.rentAmount,
        due_date: rental.dueDate,
        due_time: rental.dueTime,
        phone_number: rental.phoneNumber,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      const mapped = mapRow(data);
      setRentals(prev => [...prev, mapped]);
      return mapped;
    }
    return null;
  };

  const updateRental = async (id: string, updates: Partial<Rental>) => {
    const dbUpdates: any = {};
    if (updates.propertyName !== undefined) dbUpdates.property_name = updates.propertyName;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.rentAmount !== undefined) dbUpdates.rent_amount = updates.rentAmount;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.dueTime !== undefined) dbUpdates.due_time = updates.dueTime;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lastPaid !== undefined) dbUpdates.last_paid = updates.lastPaid;

    const { error } = await supabase.from('rentals').update(dbUpdates).eq('id', id);
    if (!error) {
      setRentals(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    }
  };

  const deleteRental = async (id: string) => {
    const { error } = await supabase.from('rentals').delete().eq('id', id);
    if (!error) {
      setRentals(prev => prev.filter(r => r.id !== id));
    }
  };

  const markAsPaid = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    await updateRental(id, { status: "paid", lastPaid: today });
  };

  const checkDueNotifications = () => {
    const today = new Date();
    rentals.forEach(rental => {
      if (rental.status === "pending") {
        const dueDateTime = new Date(rental.dueDate + "T" + rental.dueTime);
        const daysUntilDue = Math.ceil((dueDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          toast({ title: "📢 Rent Due Soon", description: `${rental.propertyName} rent is due in ${daysUntilDue} day(s).`, duration: 6000 });
        } else if (daysUntilDue < 0) {
          toast({ title: "⚠️ Rent Overdue", description: `${rental.propertyName} rent is overdue!`, duration: 6000 });
        }
      }
    });
  };

  const getRentalStats = () => {
    const totalRent = rentals.reduce((sum, r) => sum + r.rentAmount, 0);
    const pendingRent = rentals.filter(r => r.status === "pending").reduce((sum, r) => sum + r.rentAmount, 0);
    return { totalRent, pendingRent, totalProperties: rentals.length, pendingProperties: rentals.filter(r => r.status === "pending").length };
  };

  const getDueRentals = useCallback(() => {
    const today = new Date();
    return rentals.filter(rental => {
      if (rental.status !== "pending") return false;
      const dueDateTime = new Date(rental.dueDate + "T" + rental.dueTime);
      const daysUntilDue = Math.ceil((dueDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7;
    });
  }, [rentals]);

  return { rentals, loading, addRental, updateRental, deleteRental, markAsPaid, checkDueNotifications, getRentalStats, getDueRentals };
};
