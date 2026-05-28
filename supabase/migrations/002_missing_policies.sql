-- ============================================================
-- Poramorshoo — Missing RLS Policies (run after 001_schema.sql)
-- ============================================================

-- Experts: allow new expert applications from the client
DROP POLICY IF EXISTS "Experts apply" ON public.experts;
CREATE POLICY "Experts apply" ON public.experts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: allow users to insert own payments
DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
CREATE POLICY "Users insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: allow UPDATE for upsert to work on existing review
DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;
CREATE POLICY "Users update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Profiles: open SELECT to all authenticated users
-- (needed so booking/consultation pages can display names of other users)
DROP POLICY IF EXISTS "Public expert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);
