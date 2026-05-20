-- ============================================================
-- ExpertLagbe — Full Database Schema
-- Run these in order in Supabase SQL Editor
-- ============================================================

-- 001: USERS (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'expert', 'admin')),
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 002: EXPERTS
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tagline TEXT,
  bio TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  languages TEXT[] DEFAULT ARRAY['Bengali', 'English'],
  total_sessions INT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  response_rate INT DEFAULT 100,
  verification_status TEXT DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'approved', 'rejected', 'suspended')
  ),
  nid_verified BOOLEAN DEFAULT FALSE,
  certificate_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expert_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('nid_front', 'nid_back', 'certificate', 'portfolio')),
  file_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expert_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  skill TEXT NOT NULL
);

-- 003: PACKAGES
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL CHECK (duration_minutes IN (20, 30, 40)),
  price_bdt DECIMAL(10,2) NOT NULL,
  session_type TEXT[] NOT NULL DEFAULT ARRAY['video'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 004: AVAILABILITY
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- 005: BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  expert_id UUID NOT NULL REFERENCES public.experts(id),
  package_id UUID NOT NULL REFERENCES public.packages(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  price_bdt DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  expert_earnings DECIMAL(10,2) NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('chat', 'voice', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed')
  ),
  cancellation_reason TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('user', 'expert', 'admin')),
  payment_id UUID,
  consultation_room_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 006: CONSULTATION ROOMS
CREATE TABLE IF NOT EXISTS public.consultation_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id),
  agora_channel TEXT UNIQUE NOT NULL,
  agora_token_user TEXT,
  agora_token_expert TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  actual_duration_minutes INT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended'))
);

-- 007: MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.consultation_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 008: REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  expert_id UUID NOT NULL REFERENCES public.experts(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 009: PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount_bdt DECIMAL(10,2) NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('sslcommerz', 'bkash')),
  gateway_transaction_id TEXT,
  gateway_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 010: PAYOUTS
CREATE TABLE IF NOT EXISTS public.expert_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID UNIQUE NOT NULL REFERENCES public.experts(id),
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id),
  amount_bdt DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bkash', 'bank')),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  admin_note TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 011: DISPUTES
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  raised_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 012: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public expert profiles" ON public.profiles
  FOR SELECT USING (role = 'expert' OR auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Experts: public read for approved
CREATE POLICY "Public read approved experts" ON public.experts
  FOR SELECT USING (verification_status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Experts update own profile" ON public.experts
  FOR UPDATE USING (auth.uid() = user_id);

-- Bookings: users and experts see their own
CREATE POLICY "Users see own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

CREATE POLICY "Users insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Messages: room participants only
CREATE POLICY "Room participants see messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultation_rooms cr
      JOIN bookings b ON b.id = cr.booking_id
      WHERE cr.id = room_id
        AND (b.user_id = auth.uid() OR
             b.expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Room participants insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM consultation_rooms cr
      JOIN bookings b ON b.id = cr.booking_id
      WHERE cr.id = room_id
        AND (b.user_id = auth.uid() OR
             b.expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid()))
    )
  );

-- Notifications: users see own
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Payments: users see own
CREATE POLICY "Users see own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Wallets: experts see own
CREATE POLICY "Experts see own wallet" ON public.expert_wallets
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Payout requests: experts see own
CREATE POLICY "Experts see own payouts" ON public.payout_requests
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- ============================================================
-- MISSING PUBLIC READ POLICIES (packages, skills, reviews)
-- These tables need anonymous/public access for the expert listing pages
-- ============================================================
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_rooms ENABLE ROW LEVEL SECURITY;

-- Packages: public can read active packages (needed for expert profile page)
CREATE POLICY "Public read active packages" ON public.packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Experts manage own packages" ON public.packages
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Expert skills: fully public (displayed on expert cards/profiles)
CREATE POLICY "Public read expert skills" ON public.expert_skills
  FOR SELECT USING (true);

CREATE POLICY "Experts manage own skills" ON public.expert_skills
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Reviews: public read non-hidden reviews (needed for expert profile page)
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Users insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Expert documents: experts see own
CREATE POLICY "Experts see own documents" ON public.expert_documents
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

CREATE POLICY "Experts insert documents" ON public.expert_documents
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Availability slots: public read (needed for booking calendar)
CREATE POLICY "Public read availability" ON public.availability_slots
  FOR SELECT USING (true);

CREATE POLICY "Experts manage availability" ON public.availability_slots
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM experts WHERE id = expert_id)
  );

-- Consultation rooms: booking participants only
CREATE POLICY "Participants see own rooms" ON public.consultation_rooms
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM bookings WHERE id = booking_id) OR
    auth.uid() = (SELECT e.user_id FROM experts e JOIN bookings b ON b.expert_id = e.id WHERE b.id = booking_id)
  );

-- Booking messages: booking participants only
CREATE POLICY "Participants see booking messages" ON public.booking_messages
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM bookings WHERE id = booking_id) OR
    auth.uid() = (SELECT e.user_id FROM experts e JOIN bookings b ON b.expert_id = e.id WHERE b.id = booking_id)
  );

CREATE POLICY "Participants send booking messages" ON public.booking_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Disputes: participants see own
CREATE POLICY "Participants see disputes" ON public.disputes
  FOR SELECT USING (auth.uid() = raised_by);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment expert total_sessions when booking completed
CREATE OR REPLACE FUNCTION increment_expert_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE experts SET total_sessions = total_sessions + 1 WHERE id = NEW.expert_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_completed AFTER UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION increment_expert_sessions();
