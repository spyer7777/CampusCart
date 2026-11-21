-- RLS policies decide which rows a user can see; SQL grants also need to
-- allow the API roles to reach these tables in the first place.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.listings, public.users, public.campuses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.listings TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.users TO authenticated;
