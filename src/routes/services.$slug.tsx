import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Phone, FileText, Check } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { fetchServiceBySlug, getPdfPublicUrl, type Service } from "@/lib/services";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const service = await fetchServiceBySlug(params.slug);
    if (!service || !service.is_published) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.service;
    return {
      meta: s
        ? [
            { title: `${s.title} — RED STUDIO` },
            { name: "description", content: s.short_description },
            { property: "og:title", content: `${s.title} — RED STUDIO` },
            { property: "og:description", content: s.short_description },
          ]
        : [],
    };
  },
  component: ServiceDetailPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-rs py-32 text-center">
        <h1 className="display-lg">Service introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cette page n&rsquo;existe plus ou a été déplacée.</p>
        <Link to="/services" className="inline-flex items-center gap-2 mt-8 text-primary font-medium">
          <ArrowLeft className="size-4" /> Tous nos services
        </Link>
      </div>
    </PublicLayout>
  ),
});

const DELIVERABLES_BY_SLUG: Record<string, string[]> = {
  "identite-visuelle": ["Plateforme de marque", "Logo & déclinaisons", "Charte graphique complète", "Système typographique", "Templates et applications"],
  "documents-institutionnels": ["Rapport annuel / d'activité", "Présentation corporate", "Note stratégique", "Charte éditoriale"],
  "brochures-plaquettes": ["Brochure commerciale", "Company profile", "Catalogue produits", "Plaquette institutionnelle"],
  "supports-imprimes": ["Cartes de visite", "Papeterie", "Flyers & affiches", "Kakemonos & PLV"],
  "site-internet": ["Site vitrine premium", "E-commerce", "Plateforme sur-mesure", "SEO technique & contenu"],
  "ui-ux-design": ["Recherche utilisateur", "Wireframes & prototypes", "Design system", "UI haute fidélité"],
  "content-creation": ["Direction artistique", "Photo & vidéo", "Visuels réseaux sociaux", "Copywriting"],
  "community-management": ["Stratégie éditoriale", "Calendrier & créa", "Animation & modération", "Reporting mensuel"],
  "meta-ads": ["Stratégie média", "Création des publicités", "Pilotage & optimisation", "Reporting & insights"],
  "montage-video": ["Montage", "Étalonnage", "Motion design", "Sound design"],
  "ia-creative": ["Génération d'assets", "Prototypage rapide", "Automatisations créatives", "Direction artistique IA"],
};

const AUDIENCE_BY_SLUG: Record<string, string> = {
  "identite-visuelle": "Marques qui se lancent ou qui souhaitent franchir un palier d'image.",
  "documents-institutionnels": "Institutions, groupes et entreprises qui prennent la parole avec exigence.",
  "brochures-plaquettes": "Entreprises commerciales qui veulent convaincre sur un support tangible.",
  "supports-imprimes": "Marques attentives à l'expérience physique et à la qualité du détail.",
  "site-internet": "Entreprises et institutions qui veulent un site rapide, élégant et performant.",
  "ui-ux-design": "Startups et entreprises qui développent un produit numérique exigeant.",
  "content-creation": "Marques qui ont besoin d'une production de contenus régulière et qualitative.",
  "community-management": "Marques qui veulent une présence digitale incarnée et stratégique.",
  "meta-ads": "Entreprises qui veulent générer des leads et des ventes mesurables.",
  "montage-video": "Marques qui investissent la vidéo pour le digital ou le corporate.",
  "ia-creative": "Équipes qui veulent gagner en vitesse créative sans renoncer à la qualité.",
};

function ServiceDetailPage() {
  const { service } = Route.useLoaderData();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    setPdfUrl(getPdfPublicUrl(service.pdf_path));
  }, [service.pdf_path]);

  const deliverables = DELIVERABLES_BY_SLUG[service.slug] ?? ["Cadrage", "Production", "Livraison", "Suivi"];
  const audience = AUDIENCE_BY_SLUG[service.slug] ?? "Marques exigeantes qui veulent un partenaire stratégique et créatif.";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="ink-section">
        <div className="container-rs py-20 md:py-28">
          <Reveal>
            <Link to="/services" className="inline-flex items-center gap-2 text-white/60 text-sm hover:text-primary transition-colors">
              <ArrowLeft className="size-4" /> Tous les services
            </Link>
          </Reveal>
          <div className="grid lg:grid-cols-12 gap-10 mt-8 items-end">
            <Reveal className="lg:col-span-8">
              <span className="eyebrow text-primary">Service</span>
              <h1 className="display-xl mt-4 text-white text-balance">{service.title}</h1>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-4">
              <p className="text-white/75 text-lg text-pretty">{service.short_description}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container-rs py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-7 space-y-12">
            <ServiceBlock eyebrow="Présentation" title="Notre approche">
              <p>{service.long_description}</p>
            </ServiceBlock>

            <ServiceBlock eyebrow="Pour qui" title="À qui s&rsquo;adresse ce service">
              <p>{audience}</p>
            </ServiceBlock>

            <ServiceBlock eyebrow="Livrables" title="Ce que vous obtenez">
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 not-prose">
                {deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-foreground">
                    <Check className="size-5 text-primary mt-0.5 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </ServiceBlock>

            <ServiceBlock eyebrow="Bénéfices" title="La valeur que vous gagnez">
              <ul className="space-y-3">
                <li>Une image plus claire, plus reconnaissable, plus durable.</li>
                <li>Une cohérence parfaite entre tous vos points de contact.</li>
                <li>Un gain de temps : un seul interlocuteur, un seul standard.</li>
                <li>Une marque qui inspire confiance — et qui convertit.</li>
              </ul>
            </ServiceBlock>
          </Reveal>

          <aside className="lg:col-span-5">
            <Reveal delay={120}>
              <div className="lg:sticky lg:top-28 space-y-4">
                {/* PDF download card */}
                <div className="rounded-2xl bg-card border border-border p-7">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Fiche d&rsquo;offre détaillée</h3>
                  {pdfUrl ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-5">
                        Téléchargez la fiche complète : périmètre, livrables, méthodologie.
                      </p>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors w-full justify-center"
                      >
                        <Download className="size-4" /> Télécharger la fiche
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Cette fiche est en cours de mise à jour. Contactez-nous pour recevoir
                      la version la plus récente.
                    </p>
                  )}
                </div>

                {/* CTA card */}
                <div className="rounded-2xl bg-foreground text-background p-7">
                  <h3 className="text-xl font-semibold mb-2">Parlons de votre projet</h3>
                  <p className="text-sm text-background/70 mb-5">
                    Une première discussion sans engagement, pour comprendre vos enjeux.
                  </p>
                  <div className="space-y-2">
                    <Link to="/contact" className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
                      Demander un devis <ArrowRight className="size-4" />
                    </Link>
                    <Link to="/contact" className="inline-flex items-center justify-center gap-2 w-full rounded-full border border-background/30 text-background px-5 py-3 text-sm font-medium hover:bg-background hover:text-foreground transition-colors">
                      <Phone className="size-4" /> Parler à un conseiller
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

function ServiceBlock({
  eyebrow,
  title,
  children,
}: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="eyebrow text-primary">{eyebrow}</span>
      <h2 className="display-md mt-3 mb-5" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="text-lg text-muted-foreground space-y-4 text-pretty">{children}</div>
    </div>
  );
}
