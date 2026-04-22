import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Eye, X, ExternalLink, Download } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { fetchRealisations, getRealisationAssetUrl, type Realisation } from "@/lib/realisations";
import { supabase } from "@/integrations/supabase/client";
import workIdentity from "@/assets/work-identity.jpg";
import workBrochure from "@/assets/work-brochure.jpg";
import workWeb from "@/assets/work-web.jpg";
import workMobile from "@/assets/work-mobile.jpg";
import workSocial from "@/assets/work-social.jpg";
import workVideo from "@/assets/work-video.jpg";

export const Route = createFileRoute("/realisations")({
  head: () => ({
    meta: [
      { title: "Réalisations — RED STUDIO" },
      { name: "description", content: "Sélection de projets RED STUDIO : identités visuelles, sites internet, supports éditoriaux, campagnes digitales." },
      { property: "og:title", content: "Réalisations — RED STUDIO" },
      { property: "og:description", content: "Une sélection de projets récents, par catégorie." },
    ],
  }),
  component: WorkPage,
});

const FALLBACK_IMAGES = [workIdentity, workBrochure, workWeb, workMobile, workSocial, workVideo];

const CATEGORIES = [
  "Tout voir",
  "Identité visuelle",
  "Documents institutionnels",
  "Plaquettes & brochures",
  "Supports imprimés",
  "Sites internet",
  "UI/UX",
  "Community management",
  "Publicité digitale",
  "Vidéo",
  "IA créative",
] as const;

function WorkPage() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("Tout voir");
  const [open, setOpen] = useState<Realisation | null>(null);

  useEffect(() => {
    fetchRealisations().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (active === "Tout voir" ? items : items.filter((p) => p.category === active)),
    [active, items]
  );

  const pdfUrl = open?.pdf_path
    ? supabase.storage.from("realisation-assets").getPublicUrl(open.pdf_path).data.publicUrl
    : null;

  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-12">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Portfolio</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Une sélection de projets <span className="text-primary">soignés</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Chaque projet est traité comme un objet éditorial : intention claire, exécution rigoureuse,
            résultat à la hauteur de la marque qu&rsquo;il porte.
          </p>
        </Reveal>
      </section>

      <section className="container-rs pb-12">
        <Reveal>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                  active === c
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground/70 border-border hover:text-foreground hover:border-foreground/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const cover = getRealisationAssetUrl(p.cover_image_url) ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              return (
                <Reveal key={p.id} delay={(i % 3) * 60}>
                  <article className="group">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-card">
                      <img
                        src={cover}
                        alt={p.title}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        width={1200}
                        height={1500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full bg-white/95 text-foreground text-xs font-medium px-3 py-1.5">
                          {p.category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/70 mb-1">{p.client_name ?? "—"}</div>
                        <h2 className="text-lg font-display mb-3">{p.title}</h2>
                        <button
                          onClick={() => setOpen(p)}
                          className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Eye className="size-4" /> Voir
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Aucun projet dans cette catégorie pour le moment.
          </div>
        )}
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="rounded-3xl bg-foreground text-background p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-lg text-balance">Votre projet, le prochain de cette liste ?</h2>
              <p className="mt-4 text-background/70 text-lg max-w-md text-pretty">
                Discutons-en. Chaque marque a une histoire — nous savons la raconter avec style.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-medium hover:bg-primary/90 transition-colors">
                Démarrer un projet <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Detail modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(null)}
        >
          <div className="min-h-screen flex items-start md:items-center justify-center p-4">
            <div
              className="relative bg-background rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(null)}
                aria-label="Fermer"
                className="absolute top-4 right-4 z-10 size-10 rounded-full bg-background/90 backdrop-blur border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
              >
                <X className="size-5" />
              </button>
              <div className="aspect-[16/9] bg-card overflow-hidden">
                <img
                  src={getRealisationAssetUrl(open.cover_image_url) ?? FALLBACK_IMAGES[0]}
                  alt={open.title}
                  className="size-full object-cover"
                />
              </div>
              <div className="p-7 md:p-10 space-y-6">
                <div>
                  <span className="eyebrow text-primary">{open.category}</span>
                  <h2 className="display-md mt-2">{open.title}</h2>
                  {open.client_name && (
                    <p className="text-muted-foreground mt-1">Client : <span className="text-foreground">{open.client_name}</span></p>
                  )}
                </div>

                {open.description && <p className="text-foreground/80 text-pretty">{open.description}</p>}

                {(open.before_text || open.after_text) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {open.before_text && (
                      <div className="rounded-xl border border-border p-5 bg-card">
                        <div className="eyebrow text-muted-foreground mb-2">Avant</div>
                        <p className="text-sm text-foreground/80">{open.before_text}</p>
                      </div>
                    )}
                    {open.after_text && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                        <div className="eyebrow text-primary mb-2">Après</div>
                        <p className="text-sm text-foreground/90">{open.after_text}</p>
                      </div>
                    )}
                  </div>
                )}

                {open.impact && (
                  <div className="rounded-xl bg-foreground text-background p-5">
                    <div className="eyebrow text-primary mb-2">Impact</div>
                    <p className="text-sm">{open.impact}</p>
                  </div>
                )}

                {open.gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {open.gallery.map((g, i) => (
                      <img key={i} src={getRealisationAssetUrl(g) ?? g} alt="" className="aspect-square rounded-lg object-cover" loading="lazy" />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  {open.external_link && (
                    <a href={open.external_link} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors">
                      <ExternalLink className="size-4" /> Voir le projet
                    </a>
                  )}
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Download className="size-4" /> Télécharger le document
                    </a>
                  )}
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors">
                    Démarrer un projet similaire <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
