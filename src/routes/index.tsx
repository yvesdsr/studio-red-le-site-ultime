import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, Award, Users, Zap, Quote } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { fetchPublishedServices, type Service } from "@/lib/services";
import hero from "@/assets/hero-composition.jpg";
import workIdentity from "@/assets/work-identity.jpg";
import workWeb from "@/assets/work-web.jpg";
import workBrochure from "@/assets/work-brochure.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RED STUDIO — Studio créatif & communication digitale à Abidjan" },
      { name: "description", content: "Identité visuelle, design éditorial, web, contenus et stratégie digitale. Le studio des marques qui veulent compter, basé à Abidjan." },
      { property: "og:title", content: "RED STUDIO — Studio créatif premium" },
      { property: "og:description", content: "Donnons une image forte à votre marque." },
    ],
  }),
  component: HomePage,
});

const VALUE_PROPS = [
  { icon: Sparkles, title: "Créativité maîtrisée", text: "Chaque projet commence par une intention claire et se termine par un objet désirable." },
  { icon: Award, title: "Exigence éditoriale", text: "Mise en page, typographie, finitions : nous tenons la qualité du premier au dernier détail." },
  { icon: Zap, title: "Exécution rapide", text: "Une équipe agile, des process fluides, des livraisons tenues. Sans sacrifier la finesse." },
  { icon: Users, title: "Partenariat long-terme", text: "Nous construisons des marques, pas des livrables. Nous restons à vos côtés." },
];

const TESTIMONIALS = [
  { quote: "RED STUDIO a transformé notre image en quelques semaines. Un travail d&rsquo;orfèvre.", author: "Directrice marketing — Groupe industriel" },
  { quote: "Une équipe stratège, créative et terriblement efficace. Nous avons gagné en clarté.", author: "Fondateur — Fintech Abidjan" },
  { quote: "Des supports d&rsquo;une qualité éditoriale rare sur le marché ivoirien.", author: "Présidente — Institution publique" },
];

function HomePage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchPublishedServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-rs pt-12 md:pt-20 pb-16 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-8">
              <Reveal>
                <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Studio créatif · Abidjan</span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="display-xl text-balance">
                  Donnons une <span className="text-primary">image forte</span> à votre marque.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-pretty">
                  RED STUDIO conçoit l&rsquo;identité, les supports et la présence digitale des marques
                  qui refusent l&rsquo;ordinaire. Stratégie, design, contenus, web — au même endroit.
                </p>
              </Reveal>
              <Reveal delay={240} className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:bg-primary/90 ring-red transition-all hover:translate-y-[-1px]"
                >
                  Découvrir nos services <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/realisations"
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 text-foreground px-6 py-3.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  Voir nos réalisations
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full text-foreground/70 px-4 py-3.5 text-sm font-medium hover:text-primary transition-colors"
                >
                  Demander un devis <ArrowUpRight className="size-4" />
                </Link>
              </Reveal>

              <Reveal delay={320} className="flex items-center gap-8 pt-8 text-sm text-muted-foreground">
                <div><div className="display-md text-foreground">11</div><div>Expertises intégrées</div></div>
                <div className="h-10 w-px bg-border" />
                <div><div className="display-md text-foreground">100%</div><div>Sur-mesure</div></div>
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="hidden sm:block"><div className="display-md text-foreground">Abidjan</div><div>& au-delà</div></div>
              </Reveal>
            </div>

            <Reveal delay={200} className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-card shadow-elev">
                <img src={hero} alt="Composition graphique RED STUDIO" className="size-full object-cover" width={1600} height={1200} />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden md:block bg-background border border-border rounded-xl p-4 shadow-elev max-w-[220px]">
                <div className="eyebrow text-muted-foreground mb-1">Notre signature</div>
                <p className="text-sm text-foreground">Le rouge, comme une intention. Le noir, comme une discipline.</p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-border bg-card overflow-hidden">
          <div className="flex marquee whitespace-nowrap py-5 gap-12 text-sm uppercase tracking-[0.2em] text-foreground/60">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                {["Identité visuelle", "Design éditorial", "Web & UI/UX", "Community management", "Meta Ads", "Vidéo", "Création IA", "Print premium"].map((w) => (
                  <span key={w} className="flex items-center gap-12">
                    {w}
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESENTATION */}
      <section className="container-rs py-20 md:py-32">
        <div className="grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-primary">Le studio</span>
            <h2 className="display-lg mt-4 text-balance">
              Un studio intégré, pensé pour les marques ambitieuses.
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 space-y-6 text-lg text-muted-foreground text-pretty">
            <p>
              RED STUDIO réunit stratèges, designers, développeurs et créateurs de contenus
              autour d&rsquo;une même obsession : produire des marques claires, durables et désirables.
            </p>
            <p>
              De l&rsquo;identité visuelle à la campagne digitale, du document institutionnel à
              la plateforme web, nous orchestrons l&rsquo;ensemble de votre image avec la même
              exigence éditoriale.
            </p>
            <Link to="/a-propos" className="inline-flex items-center gap-2 text-foreground font-medium border-b border-foreground pb-1 hover:border-primary hover:text-primary transition-colors">
              Découvrir notre approche <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="bg-card border-y border-border">
        <div className="container-rs py-20 md:py-28">
          <Reveal>
            <span className="eyebrow text-primary">Pourquoi Red Studio</span>
            <h2 className="display-lg mt-4 max-w-2xl text-balance">Une exigence rare, à chaque étape.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {VALUE_PROPS.map((vp, i) => (
              <Reveal key={vp.title} delay={i * 80}>
                <div className="h-full bg-background border border-border rounded-2xl p-7 hover-lift">
                  <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <vp.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{vp.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{vp.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container-rs py-20 md:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <Reveal>
            <span className="eyebrow text-primary">Services</span>
            <h2 className="display-lg mt-4 max-w-2xl text-balance">Onze expertises, un seul standard.</h2>
          </Reveal>
          <Reveal delay={120}>
            <Link to="/services" className="inline-flex items-center gap-2 text-foreground font-medium border-b border-foreground pb-1 hover:border-primary hover:text-primary transition-colors">
              Tous les services <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(services.length ? services : Array.from({ length: 6 })).slice(0, 6).map((s, i) => {
            const svc = s as Service | undefined;
            return (
              <Reveal key={svc?.id ?? i} delay={i * 60}>
                <Link
                  to="/services/$slug"
                  params={{ slug: svc?.slug ?? "" }}
                  disabled={!svc}
                  className="group block h-full bg-card border border-border rounded-2xl p-7 hover-lift relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="text-xs font-mono text-muted-foreground">0{i + 1}</div>
                    <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-all" />
                  </div>
                  <h3 className="display-md text-2xl mb-3">{svc?.title ?? "—"}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{svc?.short_description}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* WORK PREVIEW */}
      <section className="ink-section">
        <div className="container-rs py-20 md:py-32">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <Reveal>
              <span className="eyebrow text-primary">Réalisations</span>
              <h2 className="display-lg mt-4 max-w-2xl text-balance text-white">
                Des marques que l&rsquo;on remarque, des supports que l&rsquo;on garde.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Link to="/realisations" className="inline-flex items-center gap-2 text-white font-medium border-b border-white/40 pb-1 hover:border-primary hover:text-primary transition-colors">
                Voir le portfolio <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            <Reveal className="lg:col-span-7">
              <div className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-black/40">
                <img src={workIdentity} alt="Identité de marque premium" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" width={1200} height={900} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0" />
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Identité visuelle</div>
                  <div className="text-xl md:text-2xl font-display text-white">Refonte d&rsquo;une marque industrielle</div>
                </div>
              </div>
            </Reveal>
            <div className="lg:col-span-5 grid gap-4">
              <Reveal delay={120}>
                <div className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-black/40">
                  <img src={workWeb} alt="Site internet premium" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" width={1200} height={900} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0" />
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Site internet</div>
                    <div className="text-lg font-display text-white">Plateforme corporate</div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-black/40">
                  <img src={workBrochure} alt="Brochure éditoriale premium" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" width={1200} height={900} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0" />
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Édition</div>
                    <div className="text-lg font-display text-white">Rapport annuel premium</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-rs py-20 md:py-32">
        <Reveal>
          <span className="eyebrow text-primary">Ils nous ont fait confiance</span>
          <h2 className="display-lg mt-4 max-w-2xl text-balance">La preuve par les marques.</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <figure className="h-full bg-card border border-border rounded-2xl p-7 flex flex-col">
                <Quote className="size-7 text-primary mb-4" />
                <blockquote className="text-foreground text-balance flex-1" dangerouslySetInnerHTML={{ __html: `« ${t.quote} »` }} />
                <figcaption className="mt-6 pt-4 border-t border-border text-sm text-muted-foreground">— {t.author}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200} className="text-center mt-12">
          <Link to="/confiance" className="inline-flex items-center gap-2 text-foreground font-medium border-b border-foreground pb-1 hover:border-primary hover:text-primary transition-colors">
            Voir tous nos clients <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="relative rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 overflow-hidden">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="eyebrow text-white/80">Prêts à commencer ?</span>
                <h2 className="display-lg mt-4 text-balance">Confiez-nous votre image.</h2>
                <p className="mt-4 text-white/85 text-lg max-w-md text-pretty">
                  Parlons de votre projet. Nous revenons vers vous sous 48h avec une première lecture stratégique.
                </p>
              </div>
              <div className="md:text-right">
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-sm font-medium hover:bg-background hover:text-foreground transition-colors">
                  Démarrer un projet <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
