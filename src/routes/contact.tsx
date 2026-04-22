import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RED STUDIO" },
      { name: "description", content: "Parlons de votre projet. Studio créatif basé à Abidjan. Réponse sous 48h." },
      { property: "og:title", content: "Contact — RED STUDIO" },
      { property: "og:description", content: "Confiez-nous votre image. Donnez vie à vos idées avec Red Studio." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis").max(120),
  email: z.string().trim().email("Email invalide").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Décrivez votre projet en quelques mots").max(5000),
});

function ContactPage() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") ?? "",
      subject: fd.get("subject") ?? "",
      message: fd.get("message"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setState("loading");
    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    if (dbError) {
      setState("error");
      setError("Une erreur est survenue. Réessayez ou contactez-nous directement.");
      return;
    }
    setState("success");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <PublicLayout>
      <section className="container-rs pt-12 md:pt-20 pb-12">
        <Reveal>
          <span className="red-pill"><span className="size-1.5 rounded-full bg-primary" /> Contact</span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-xl mt-6 max-w-4xl text-balance">
            Parlons de votre <span className="text-primary">projet</span>.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Décrivez-nous votre besoin, votre contexte, vos contraintes. Nous revenons vers vous
            sous 48h avec une première lecture stratégique.
          </p>
        </Reveal>
      </section>

      <section className="container-rs pb-20 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-10">
          <Reveal className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-7">
              <h3 className="text-lg font-semibold mb-5">Contactez-nous directement</h3>
              <ul className="space-y-4 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Studio</div>
                    <div>Abidjan, Côte d&rsquo;Ivoire</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Téléphone</div>
                    <a href="tel:+22500000000" className="hover:text-primary transition-colors">+225 00 00 00 00</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</div>
                    <a href="mailto:contact@redstudio.ci" className="hover:text-primary transition-colors">contact@redstudio.ci</a>
                  </div>
                </li>
              </ul>
              <a
                href="https://wa.me/22500000000"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-primary transition-colors"
              >
                <MessageCircle className="size-4" /> Discuter sur WhatsApp
              </a>
            </div>

            <div className="rounded-2xl bg-foreground text-background p-7">
              <h3 className="text-xl font-display mb-2">Donnez vie à vos idées avec Red Studio.</h3>
              <p className="text-sm text-background/70">
                Une équipe à l&rsquo;écoute, des process clairs, une réponse rapide.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-7">
            <form onSubmit={onSubmit} className="rounded-2xl bg-background border border-border p-7 md:p-10 space-y-5">
              {state === "success" ? (
                <div className="text-center py-8">
                  <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h2 className="display-md mb-3">Message envoyé.</h2>
                  <p className="text-muted-foreground">Nous revenons vers vous très vite. Merci de votre confiance.</p>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-6 inline-flex items-center gap-2 text-foreground font-medium border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Nom complet" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Téléphone" name="phone" type="tel" />
                    <Field label="Sujet" name="subject" />
                  </div>
                  <Field label="Votre projet" name="message" textarea required />

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {state === "loading" ? "Envoi…" : (<><Send className="size-4" /> Envoyer le message</>)}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    En envoyant ce message vous acceptez d&rsquo;être recontacté par RED STUDIO.
                  </p>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}{required && <span className="text-primary"> *</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={6}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      )}
    </label>
  );
}
