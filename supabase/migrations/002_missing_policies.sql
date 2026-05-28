-- ============================================================
-- Poramorshoo — Missing RLS Policies (run after 001_schema.sql)
-- ============================================================

-- Experts: allow new expert applications from the client
CREATE POLICY IF NOT EXISTS "Experts apply" ON public.experts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Experts: allow UPDATE for avg_rating from reviews (via service role — this covers direct RLS path)
CREATE POLICY IF NOT EXISTS "Experts public update stats" ON public.experts
  FOR UPDATE USING (true);

-- Notifications: allow any authenticated user to read own notifications (already covered)
-- Allow INSERT via service role only (no additional client-side policy needed since API routes use service role)

-- Payments: allow users to insert own payments
CREATE POLICY IF NOT EXISTS "Users insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: allow UPDATE (for upsert to work on existing review)
CREATE POLICY IF NOT EXISTS "Users update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Expert wallets: allow INSERT via service role (no client-side insert needed)
-- Expert wallets: allow experts to read own wallet (already exists)

-- Profiles: allow any authenticated user to read any profile
-- (needed for booking pages to show expert/user names)
DROP POLICY IF EXISTS "Public expert profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);
