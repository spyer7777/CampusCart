-- Make the marketplace public to browse and available to every signed-in seller.
ALTER TABLE public.listings ALTER COLUMN campus_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view listings from their campus" ON public.listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
CREATE POLICY "Anyone can view listings" ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
CREATE POLICY "Users can create listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    (campus_id IS NULL OR campus_id IN (
      SELECT campus_id FROM public.users WHERE id = auth.uid()
    ))
  );
