import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote, TrendingUp, Eye, Sparkles, Layers } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/confiance")({
  head: () => ({
    meta: [
      { title: "Ils nous ont fait confiance — RED STUDIO" },
      { name: "description", content: "Découvrez les marques, entreprises et institutions qui nous confient leur image." },
      { property: "og:title", content: "Ils nous ont fait confiance — RED STUDIO" },
      { property: "og:description", content: "La preuve par les marques." },
    ],
  }),
  component: TrustPage,
});

const CLIENTS = [
  "Groupe IFA", "Cabinet Lévrier", "Ivoire Capital", "Studio Mango", "Maison Yao",
  "Festival 225", "Fintech Wari", "Atelier Noir", "Marque Lifestyle", "Cabinet d'avocats",
  "Groupe agroalimentaire", "Institution publique",
];

const CASE_STUDIES = [
  {
    client: "Groupe industriel",
    category: "Refonte d'identité",
    challenge: "Une marque historique mais datée, sans cohérence sur ses supports.",
    solution: "Une plateforme de marque complète, un nouveau système visuel et 40+ déclinaisons.",
    impact: ["Visibilité accrue", "Image renforcée", "Supports modernisés"],
  },
  {
    client: "Cabinet de conseil",
    category: "Site internet & contenu",
    challenge: "Un site vieillissant et un discours peu différenciant.",
    solution: "Refonte complète, narration éditoriale, SEO solide et templates internes.",
    impact: ["Présence digitale améliorée", "+ de leads qualifiés", "Discours clarifié"],
  },
  {
    client: "Marque lifestyle",
    category: "Stratégie social media",
    challenge: "Un compte irrégulier, sans ligne directrice ni esthétique forte.",
    solution: "Stratégie éditoriale, charte sociale, planning créatif et community management.",
    impact: ["Audience x3 en 6 mois", "Engagement doublé", "Ventes en ligne en hausse"],
  },
];

const IMPACT_ICONS: Record<string, typeof TrendingUp> = {
  "Visibilité accrue": Eye,
  "Image renforcée": Sparkles,
  "Supports modernisés": Layers,
  "Présence digitale améliorée": TrendingUp,
};

function TrustPage() {
  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-12">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> La preuve</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Ils nous ont fait <span className="text-primary">confiance</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Des startups aux institutions, des marques lifestyle aux groupes industriels :
            une diversité de partenaires, un même standard d&rsquo;exigence.
          </p>
        </Reveal>
      </section>

      {/* Clients grid */}
      <section className="container-rs py-12">
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {CLIENTS.map((c) => (
              <div
                key={c}
                className="bg-background p-6 md:p-8 flex items-center justify-center min-h-[100px] text-center hover:bg-card transition-colors group"
              >
                <span className="text-foreground/60 group-hover:text-foreground font-display text-sm md:text-base transition-colors">
                  {c}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Case studies */}
      <section className="bg-card border-y border-border">
        <div className="container-rs py-20 md:py-28">
          <Reveal>
            <span className="eyebrow text-primary">Études de cas</span>
            <h2 className="display-lg mt-4 max-w-2xl text-balance">Quelques histoires que nous avons accompagnées.</h2>
          </Reveal>

          <div className="mt-12 space-y-6">
            {CASE_STUDIES.map((cs, i) => (
              <Reveal key={cs.client} delay={i * 100}>
                <article className="grid lg:grid-cols-12 gap-8 bg-background border border-border rounded-2xl p-7 md:p-10">
                  <div className="lg:col-span-3">
                    <span className="eyebrow text-primary">{cs.category}</span>
                    <h3 className="display-md text-2xl mt-3">{cs.client}</h3>
                  </div>
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Le défi</div>
                      <p className="text-foreground text-pretty">{cs.challenge}</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Notre réponse</div>
                      <p className="text-foreground text-pretty">{cs.solution}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Impact</div>
                    <div className="flex flex-wrap gap-2">
                      {cs.impact.map((m) => {
                        const Icon = IMPACT_ICONS[m] ?? TrendingUp;
                        return (
                          <span key={m} className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium">
                            <Icon className="size-3.5" /> {m}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Big quote */}
      <section className="container-rs py-20 md:py-32">
        <Reveal>
          <figure className="max-w-3xl mx-auto text-center">
            <Quote className="size-10 text-primary mx-auto mb-6" />
            <blockquote className="display-lg text-balance">
              « RED STUDIO ne livre pas des fichiers, ils livrent une marque. »
            </blockquote>
            <figcaption className="mt-8 text-muted-foreground">— Directrice marketing, groupe industriel</figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-lg text-balance">Devenez le prochain.</h2>
              <p className="mt-4 text-white/85 text-lg max-w-md text-pretty">
                Rejoignez les marques qui ont décidé de hausser le niveau de leur image.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-sm font-medium hover:bg-background hover:text-foreground transition-colors">
                Confiez-nous votre image <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
