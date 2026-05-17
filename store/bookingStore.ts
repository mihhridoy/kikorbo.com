import { create } from 'zustand';
import type { Package } from '@/lib/supabase/types';

interface BookingState {
  selectedPackage: Package | null;
  selectedSessionType: 'chat' | 'voice' | 'video';
  selectedDate: Date | null;
  selectedTime: string | null;
  notes: string;
  setSelectedPackage: (pkg: Package | null) => void;
  setSelectedSessionType: (type: 'chat' | 'voice' | 'video') => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedPackage: null,
  selectedSessionType: 'video',
  selectedDate: null,
  selectedTime: null,
  notes: '',
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  setSelectedSessionType: (type) => set({ selectedSessionType: type }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setNotes: (notes) => set({ notes }),
  reset: () => set({
    selectedPackage: null,
    selectedSessionType: 'video',
    selectedDate: null,
    selectedTime: null,
    notes: '',
  }),
}));
