import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { fetchClients, getClientLogoUrl, type Client } from "@/lib/realisations";

export const Route = createFileRoute("/confiance")({
  head: () => ({
    meta: [
      { title: "Ils nous font confiance — RED STUDIO" },
      { name: "description", content: "Marques, institutions et entreprises qui font confiance à RED STUDIO." },
      { property: "og:title", content: "Ils nous font confiance — RED STUDIO" },
      { property: "og:description", content: "La preuve par les marques que nous accompagnons." },
    ],
  }),
  component: ConfiancePage,
});

function ConfiancePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients().then(setClients).catch(() => setClients([])).finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-12">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Confiance</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Ils nous ont fait <span className="text-primary">confiance</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Marques émergentes, groupes établis, institutions publiques — chaque collaboration
            est conduite avec la même exigence éditoriale.
          </p>
        </Reveal>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Cette section sera enrichie très prochainement.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c, i) => {
              const logo = getClientLogoUrl(c.logo_url);
              return (
                <Reveal key={c.id} delay={(i % 3) * 60}>
                  <article className="h-full bg-card border border-border rounded-2xl p-7 hover-lift">
                    <div className="size-14 rounded-xl bg-background border border-border flex items-center justify-center mb-5 overflow-hidden">
                      {logo ? (
                        <img src={logo} alt={c.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Building2 className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <h2 className="text-lg font-semibold mb-2">{c.name}</h2>
                    {c.summary && <p className="text-sm text-muted-foreground text-pretty">{c.summary}</p>}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="rounded-3xl bg-foreground text-background p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-lg text-balance">Rejoignez-les.</h2>
              <p className="mt-4 text-background/70 text-lg max-w-md text-pretty">
                Confiez-nous votre image. Nous en faisons un atout durable.
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
