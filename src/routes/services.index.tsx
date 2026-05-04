import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, type LucideIcon, Sparkles, FileText, BookOpen, CreditCard, Globe, Layout, Camera, MessageCircle, Target, Video, Cpu } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { fetchPublishedServices, type Service } from "@/lib/services";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — RED STUDIO" },
      { name: "description", content: "Identité visuelle, design éditorial, web, UI/UX, contenus, community management, Meta Ads, vidéo et IA créative. Onze expertises au service de votre marque." },
      { property: "og:title", content: "Services — RED STUDIO" },
      { property: "og:description", content: "Onze expertises intégrées pour bâtir une marque forte." },
    ],
  }),
  component: ServicesPage,
});

const ICONS: Record<string, LucideIcon> = {
  Sparkles, FileText, BookOpen, CreditCard, Globe, Layout, Camera, MessageCircle, Target, Video, Cpu,
};

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-12">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Nos expertises</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Tout ce qu&rsquo;il faut pour faire <span className="text-primary">exister</span> votre marque.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            De la première intuition au déploiement complet : stratégie, design, production
            et diffusion. Chaque expertise est tenue par des spécialistes, orchestrée par
            une direction artistique unique.
          </p>
        </Reveal>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-card border border-border animate-pulse" />
              ))
            : services.map((s, i) => {
                const Icon = ICONS[s.icon ?? ""] ?? Sparkles;
                return (
                  <Reveal key={s.id} delay={(i % 3) * 80}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="group block h-full bg-card border border-border rounded-2xl p-7 hover-lift relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 className="display-md text-2xl mb-3 text-balance">{s.title}</h2>
                      <p className="text-sm text-muted-foreground text-pretty mb-6">{s.short_description}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        En savoir plus <ArrowUpRight className="size-4 group-hover:rotate-12 transition-transform" />
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                    </Link>
                  </Reveal>
                );
              })}
        </div>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="rounded-3xl bg-foreground text-background p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-lg text-balance">Un projet sur-mesure ?</h2>
              <p className="mt-4 text-background/70 text-lg max-w-md text-pretty">
                Décrivez-nous votre besoin. Nous vous proposons un dispositif adapté, transparent et chiffré.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-4 text-sm font-medium hover:bg-primary/90 transition-colors">
                Demander un devis <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
