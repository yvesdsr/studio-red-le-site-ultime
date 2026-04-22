import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
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

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) {
        setError(error.message === "User already registered"
          ? "Un compte existe déjà pour cet email. Connectez-vous."
          : error.message);
        return;
      }
      setInfo("Compte créé. Un administrateur doit vous attribuer le rôle 'admin' pour accéder au panneau.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError("Identifiants invalides. Vérifiez votre email et mot de passe.");
        return;
      }
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container-rs py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="RED STUDIO" className="h-9 w-auto" />
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
              {mode === "signin" ? "Connectez-vous pour gérer le site." : "Créez un compte administrateur."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-7 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Mot de passe</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </label>

            {error && (
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" /> {error}
              </p>
            )}
            {info && <p className="text-sm text-muted-foreground">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin"
                ? "Pas encore de compte ? Créer un compte administrateur"
                : "Déjà un compte ? Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Le premier compte créé doit recevoir le rôle <code className="font-mono text-foreground">admin</code> dans la table <code className="font-mono text-foreground">user_roles</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
