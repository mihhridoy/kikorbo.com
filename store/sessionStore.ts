import { create } from 'zustand';
import type { ConsultationRoom, Booking } from '@/lib/supabase/types';

interface SessionState {
  room: ConsultationRoom | null;
  booking: Booking | null;
  isExpert: boolean;
  agoraToken: string | null;
  setRoom: (room: ConsultationRoom | null) => void;
  setBooking: (booking: Booking | null) => void;
  setIsExpert: (isExpert: boolean) => void;
  setAgoraToken: (token: string | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  room: null,
  booking: null,
  isExpert: false,
  agoraToken: null,
  setRoom: (room) => set({ room }),
  setBooking: (booking) => set({ booking }),
  setIsExpert: (isExpert) => set({ isExpert }),
  setAgoraToken: (token) => set({ agoraToken: token }),
  reset: () => set({ room: null, booking: null, isExpert: false, agoraToken: null }),
}));
