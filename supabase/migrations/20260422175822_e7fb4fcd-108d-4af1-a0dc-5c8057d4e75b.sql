
-- Realisations
CREATE TABLE public.realisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  client_name text,
  cover_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  before_text text,
  after_text text,
  impact text,
  external_link text,
  pdf_path text,
  display_order int NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published realisations" ON public.realisations
  FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert realisations" ON public.realisations
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update realisations" ON public.realisations
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete realisations" ON public.realisations
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_realisations_updated_at BEFORE UPDATE ON public.realisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  summary text,
  link text,
  display_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible clients" ON public.clients
  FOR SELECT USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete clients" ON public.clients
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Liaison client <-> realisation
CREATE TABLE public.client_realisations (
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  realisation_id uuid NOT NULL REFERENCES public.realisations(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, realisation_id)
);
ALTER TABLE public.client_realisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view client_realisations" ON public.client_realisations
  FOR SELECT USING (true);
CREATE POLICY "Admins manage client_realisations" ON public.client_realisations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin profiles (username mapping)
CREATE TABLE public.admin_profiles (
  user_id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read admin profiles" ON public.admin_profiles
  FOR SELECT USING (true);
CREATE POLICY "Admins manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Demandes d'accès admin
CREATE TABLE public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text NOT NULL,
  full_name text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit admin request" ON public.admin_requests
  FOR INSERT WITH CHECK (
    char_length(username) BETWEEN 3 AND 60
    AND char_length(email) BETWEEN 3 AND 254
    AND char_length(coalesce(message,'')) <= 2000
  );
CREATE POLICY "Admins read admin requests" ON public.admin_requests
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update admin requests" ON public.admin_requests
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete admin requests" ON public.admin_requests
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('realisation-assets', 'realisation-assets', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('client-logos', 'client-logos', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies (public read, admin write) — realisation-assets
CREATE POLICY "Public read realisation-assets" ON storage.objects FOR SELECT
  USING (bucket_id = 'realisation-assets');
CREATE POLICY "Admin write realisation-assets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'realisation-assets' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update realisation-assets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'realisation-assets' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete realisation-assets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'realisation-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies — client-logos
CREATE POLICY "Public read client-logos" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');
CREATE POLICY "Admin write client-logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-logos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update client-logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'client-logos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete client-logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-logos' AND has_role(auth.uid(), 'admin'::app_role));
