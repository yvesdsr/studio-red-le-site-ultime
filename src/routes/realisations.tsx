import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
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

const CATEGORIES = [
  "Tout voir",
  "Identité visuelle",
  "Édition",
  "Site internet",
  "UI/UX",
  "Community management",
  "Vidéo",
] as const;
type Category = typeof CATEGORIES[number];

const PROJECTS: Array<{ title: string; client: string; category: Category; image: string }> = [
  { title: "Refonte d'une marque industrielle", client: "Groupe IFA", category: "Identité visuelle", image: workIdentity },
  { title: "Rapport annuel premium", client: "Institution publique", category: "Édition", image: workBrochure },
  { title: "Plateforme corporate", client: "Cabinet de conseil", category: "Site internet", image: workWeb },
  { title: "Application mobile fintech", client: "Startup Abidjan", category: "UI/UX", image: workMobile },
  { title: "Stratégie social media", client: "Marque lifestyle", category: "Community management", image: workSocial },
  { title: "Film de marque", client: "Groupe agroalimentaire", category: "Vidéo", image: workVideo },
  { title: "Identité événementielle", client: "Festival culturel", category: "Identité visuelle", image: workIdentity },
  { title: "Plaquette commerciale", client: "Cabinet d'avocats", category: "Édition", image: workBrochure },
  { title: "Site e-commerce", client: "Marque mode", category: "Site internet", image: workWeb },
];

function WorkPage() {
  const [active, setActive] = useState<Category>("Tout voir");
  const filtered = useMemo(
    () => (active === "Tout voir" ? PROJECTS : PROJECTS.filter((p) => p.category === active)),
    [active]
  );

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <Reveal key={`${p.title}-${i}`} delay={(i % 3) * 60}>
              <article className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-card">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={1200}
                    height={1500}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-90" />
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-white/95 text-foreground text-xs font-medium px-3 py-1.5">
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-white/70 mb-1">{p.client}</div>
                        <h3 className="text-lg font-display">{p.title}</h3>
                      </div>
                      <ArrowUpRight className="size-5 text-white shrink-0 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
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
    </PublicLayout>
  );
}
