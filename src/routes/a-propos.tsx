import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Heart, Lightbulb, Target } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — RED STUDIO" },
      { name: "description", content: "RED STUDIO, studio créatif et agence de communication digitale à Abidjan. Notre mission, notre vision et nos valeurs." },
      { property: "og:title", content: "À propos — RED STUDIO" },
      { property: "og:description", content: "Le studio des marques qui veulent compter." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Lightbulb, title: "Créativité", text: "L'idée juste, exprimée avec précision et personnalité." },
  { icon: Target, title: "Excellence", text: "Une exigence éditoriale tenue à chaque étape, sans concession." },
  { icon: Heart, title: "Engagement", text: "Nous embarquons avec nos clients, sur la durée, comme partenaires." },
  { icon: Compass, title: "Innovation", text: "L'IA, le motion, le web : des outils nouveaux, au service du fond." },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-16 md:pb-24">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Le studio</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Un studio créatif, pensé comme une <span className="text-primary">maison d&rsquo;édition</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            RED STUDIO est un studio créatif et une agence de communication digitale basée à Abidjan.
            Nous accompagnons marques, entreprises, entrepreneurs et institutions qui veulent
            construire une image forte, durable et désirable.
          </p>
        </Reveal>
      </section>

      <section className="bg-card border-y border-border">
        <div className="container-rs py-20 md:py-28 grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-primary">Notre mission</span>
            <h2 className="display-lg mt-4 text-balance">Faire exister des marques que l&rsquo;on remarque.</h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 text-lg text-muted-foreground space-y-5 text-pretty">
            <p>
              Donner aux marques d&rsquo;Afrique de l&rsquo;Ouest les outils et le langage visuel
              qu&rsquo;elles méritent : une identité claire, des supports premium, une présence digitale
              maîtrisée.
            </p>
            <p>
              Nous croyons qu&rsquo;une marque bien construite n&rsquo;est pas un luxe : c&rsquo;est un
              accélérateur stratégique. Plus de visibilité, plus de crédibilité, plus de business.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-rs py-20 md:py-28 grid lg:grid-cols-12 gap-12">
        <Reveal className="lg:col-span-5">
          <span className="eyebrow text-primary">Notre vision</span>
          <h2 className="display-lg mt-4 text-balance">Devenir une référence créative, en Côte d&rsquo;Ivoire et au-delà.</h2>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-7 text-lg text-muted-foreground space-y-5 text-pretty">
          <p>
            Nous voulons élever le standard de la création et de la communication sur le continent.
            Construire un studio reconnu pour son exigence, son sens du détail et sa capacité à
            faire grandir les marques avec lesquelles il travaille.
          </p>
          <p>
            Notre ambition est simple : qu&rsquo;à terme, une marque africaine n&rsquo;ait plus à choisir
            entre proximité et excellence.
          </p>
        </Reveal>
      </section>

      <section className="bg-card border-y border-border">
        <div className="container-rs py-20 md:py-28">
          <Reveal>
            <span className="eyebrow text-primary">Nos valeurs</span>
            <h2 className="display-lg mt-4 max-w-2xl text-balance">Quatre principes, une seule discipline.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="h-full bg-background border border-border rounded-2xl p-7 hover-lift">
                  <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <v.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-rs py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-primary">Notre approche</span>
            <h2 className="display-lg mt-4 text-balance">Du sens, puis du style.</h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 text-lg text-muted-foreground space-y-5 text-pretty">
            <p>
              Nous commençons toujours par le fond : qui est la marque, à qui parle-t-elle, que veut-elle prouver ?
              Vient ensuite la forme : système graphique, écriture, supports.
            </p>
            <p>
              Chaque mission suit un fil conducteur : <strong className="text-foreground">cadrage stratégique,
              direction créative, production rigoureuse, livraison soignée</strong>. Et pour les marques qui le
              souhaitent, nous restons à leurs côtés dans la durée.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <Reveal>
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="display-lg text-balance">Construisons quelque chose de remarquable.</h2>
              <p className="mt-4 text-white/85 text-lg max-w-md text-pretty">
                Vous avez un projet, une intuition, une ambition. Nous avons l&rsquo;équipe, la méthode et la créativité.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-sm font-medium hover:bg-background hover:text-foreground transition-colors">
                Démarrer un projet <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
