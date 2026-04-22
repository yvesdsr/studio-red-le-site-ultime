import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/red-studio-logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Espace administrateur — RED STUDIO" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "request">("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    try {
      // Resolve username -> internal email via edge function
      const res = await fetch(`${FUNCTIONS_BASE}/resolve-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setLoading(false);
        setError("Identifiants invalides.");
        return;
      }
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: json.email, password });
      setLoading(false);
      if (signErr) {
        setError("Identifiants invalides.");
        return;
      }
      navigate({ to: "/admin" });
    } catch (_) {
      setLoading(false);
      setError("Connexion impossible. Réessayez.");
    }
  }

  async function onRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      username: String(fd.get("username") ?? "").trim().toLowerCase(),
      email: String(fd.get("email") ?? "").trim(),
      full_name: String(fd.get("full_name") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/admin-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok || !json.ok) {
        setError(json.error || "Une erreur est survenue.");
        return;
      }
      setInfo("Demande envoyée. Vous recevrez un email dès qu'un administrateur l'aura validée.");
      (e.target as HTMLFormElement).reset();
    } catch (_) {
      setLoading(false);
      setError("Une erreur réseau est survenue.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container-rs py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="RED STUDIO" className="h-12 w-auto" />
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> Retour au site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="size-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
              <Lock className="size-5" />
            </div>
            <h1 className="display-md text-2xl">Espace administrateur</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "signin" ? "Connectez-vous avec votre identifiant." : "Demandez l'accès au panneau."}
            </p>
          </div>

          {mode === "signin" ? (
            <form onSubmit={onSignIn} className="bg-card border border-border rounded-2xl p-7 space-y-4">
              <Field name="username" label="Identifiant" autoComplete="username" required />
              <Field name="password" label="Mot de passe" type="password" autoComplete="current-password" required />

              {error && <Msg type="error">{error}</Msg>}
              {info && <Msg type="info">{info}</Msg>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? "…" : "Se connecter"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("request"); setError(null); setInfo(null); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Demander un accès administrateur
              </button>
            </form>
          ) : (
            <form onSubmit={onRequest} className="bg-card border border-border rounded-2xl p-7 space-y-4">
              <Field name="full_name" label="Votre nom complet" required />
              <Field name="email" label="Votre email" type="email" required />
              <Field name="username" label="Identifiant souhaité" required />
              <Field name="message" label="Pourquoi cet accès ?" textarea />

              {error && <Msg type="error">{error}</Msg>}
              {info && <Msg type="info">{info}</Msg>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Envoi…" : "Envoyer la demande"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Déjà un compte ? Se connecter
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  name, label, type = "text", required, autoComplete, textarea,
}: { name: string; label: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}{required && <span className="text-primary"> *</span>}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      )}
    </label>
  );
}

function Msg({ type, children }: { type: "error" | "info"; children: React.ReactNode }) {
  if (type === "error") {
    return <p className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="size-4 mt-0.5 shrink-0" /> {children}</p>;
  }
  return <p className="flex items-start gap-2 text-sm text-foreground/80"><CheckCircle2 className="size-4 mt-0.5 shrink-0 text-primary" /> {children}</p>;
}
