-- =========================
-- ROLES
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- TIMESTAMP TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- SERVICES
-- =========================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  icon TEXT,
  image_url TEXT,
  pdf_path TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published services"
  ON public.services FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert services"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete services"
  ON public.services FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- CONTACT MESSAGES
-- =========================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 254
    AND char_length(message) BETWEEN 1 AND 5000
  );

CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- STORAGE BUCKET FOR PDFS
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-pdfs', 'service-pdfs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read service PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-pdfs');

CREATE POLICY "Admins can upload service PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'service-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update service PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'service-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete service PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- =========================
-- SEED SERVICES
-- =========================
INSERT INTO public.services (slug, title, short_description, long_description, icon, display_order) VALUES
('identite-visuelle', 'Identité visuelle et logo',
 'Une identité forte, durable et reconnaissable, conçue pour incarner votre vision.',
 'Nous créons des systèmes d''identité complets : logo, palette, typographie, principes graphiques et déclinaisons. Chaque marque devient un territoire visuel cohérent, élégant et mémorable.',
 'Sparkles', 1),
('documents-institutionnels', 'Documents institutionnels',
 'Rapports, présentations et documents corporate à la hauteur de votre image.',
 'Mise en page éditoriale, hiérarchie claire, finitions premium. Vos documents institutionnels deviennent des outils stratégiques de crédibilité.',
 'FileText', 2),
('brochures-plaquettes', 'Design de brochures et plaquettes',
 'Des supports commerciaux qui racontent, convainquent et marquent les esprits.',
 'Conception graphique, rédaction d''accroches, choix d''images et impression. Brochures, plaquettes et company profiles taillés pour vos cibles.',
 'BookOpen', 3),
('supports-imprimes', 'Cartes de visite et supports imprimés',
 'Cartes, flyers, kakemonos, packaging — la matière au service de la marque.',
 'Choix des papiers, finitions, dorures, vernis sélectifs. Chaque support imprimé devient un objet désirable qui prolonge l''expérience de marque.',
 'CreditCard', 4),
('site-internet', 'Création de site internet',
 'Des sites rapides, élégants et pensés pour convertir.',
 'Sites vitrines, e-commerce, plateformes sur-mesure. Architecture claire, SEO solide, performance et design premium.',
 'Globe', 5),
('ui-ux-design', 'UI/UX design',
 'Des interfaces sobres, intuitives et désirables.',
 'Recherche, wireframes, design systems, prototypes interactifs. Nous concevons des produits numériques qui se manipulent avec plaisir.',
 'Layout', 6),
('content-creation', 'Création de contenus',
 'Photos, visuels, motion et copywriting au service de votre récit.',
 'Direction artistique, shooting, illustrations, contenus pour réseaux sociaux. Nous fabriquons des contenus qui ressemblent à votre marque.',
 'Camera', 7),
('community-management', 'Community management',
 'Une présence stratégique, régulière et incarnée sur vos réseaux.',
 'Stratégie éditoriale, planning, créa, animation, modération et reporting. Nous transformons vos réseaux en véritables canaux de marque.',
 'MessageCircle', 8),
('meta-ads', 'Meta Ads / publicité digitale',
 'Des campagnes pilotées par la donnée, pensées pour l''impact.',
 'Stratégie média, ciblage, créas conversionnelles, A/B test, optimisation continue. Chaque euro investi est suivi et arbitré.',
 'Target', 9),
('montage-video', 'Montage vidéo',
 'Des films courts et puissants pour porter votre message.',
 'Montage, étalonnage, motion design, sound design. Formats publicitaires, corporate, réseaux sociaux.',
 'Video', 10),
('ia-creative', 'Solutions créatives avec l''IA',
 'L''intelligence artificielle au service de la création, jamais l''inverse.',
 'Génération d''assets, prototypage rapide, automatisations créatives, exploration visuelle. Nous combinons IA et direction artistique humaine.',
 'Cpu', 11);
