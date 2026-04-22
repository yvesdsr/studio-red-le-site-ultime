import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Lock, LogOut, Save, Upload, Trash2, ExternalLink, FileText, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import logo from "@/assets/red-studio-logo.png";
import type { Service } from "@/lib/services";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — RED STUDIO" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { loading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return <CenteredScreen><Loader2 className="size-6 animate-spin text-primary" /></CenteredScreen>;
  }
  if (!user) return null;
  if (!isAdmin) return <NotAuthorized email={user.email ?? ""} />;

  return <AdminDashboard email={user.email ?? ""} />;
}

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center bg-background">{children}</div>;
}

function NotAuthorized({ email }: { email: string }) {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="size-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
          <Lock className="size-5" />
        </div>
        <h1 className="display-md text-2xl mb-3">Accès non autorisé</h1>
        <p className="text-muted-foreground mb-2">
          Le compte <span className="font-medium text-foreground">{email}</span> n&rsquo;a pas le rôle administrateur.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Demandez à un administrateur d&rsquo;ajouter votre identifiant utilisateur dans la table <code className="font-mono">user_roles</code> avec le rôle <code className="font-mono">admin</code>.
        </p>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors">
          <LogOut className="size-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ email }: { email: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });
    if (!error) setServices((data ?? []) as Service[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-rs py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Site"><img src={logo} alt="RED STUDIO" className="h-9 w-auto" /></Link>
            <span className="hidden sm:inline-block text-xs uppercase tracking-[0.15em] text-muted-foreground border-l border-border pl-3 ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" /> Voir le site
            </Link>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-card transition-colors">
              <LogOut className="size-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container-rs py-10 md:py-14">
        <div className="mb-10">
          <span className="eyebrow text-primary">Tableau de bord</span>
          <h1 className="display-lg mt-3">Gestion des services</h1>
          <p className="mt-2 text-muted-foreground">Connecté : <span className="text-foreground">{email}</span></p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Chargement…</div>
        ) : (
          <div className="space-y-4">
            {services.map((s) => (
              <ServiceRow key={s.id} service={s} onChange={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ServiceRow({ service, onChange }: { service: Service; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(service.title);
  const [shortDesc, setShortDesc] = useState(service.short_description);
  const [longDesc, setLongDesc] = useState(service.long_description ?? "");
  const [published, setPublished] = useState(service.is_published);
  const [order, setOrder] = useState(service.display_order);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfPath, setPdfPath] = useState(service.pdf_path);
  const [msg, setMsg] = useState<string | null>(null);

  const pdfUrl = pdfPath ? supabase.storage.from("service-pdfs").getPublicUrl(pdfPath).data.publicUrl : null;

  async function save() {
    setSaving(true); setMsg(null);
    const { error } = await supabase
      .from("services")
      .update({
        title, short_description: shortDesc, long_description: longDesc,
        is_published: published, display_order: order,
      })
      .eq("id", service.id);
    setSaving(false);
    if (error) { setMsg("Erreur : " + error.message); return; }
    setMsg("Enregistré.");
    onChange();
    setTimeout(() => setMsg(null), 2000);
  }

  async function uploadPdf(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setMsg("Le fichier doit être un PDF."); return; }
    if (file.size > 15 * 1024 * 1024) { setMsg("Fichier trop lourd (15 Mo max)."); return; }
    setUploading(true); setMsg(null);
    const path = `${service.slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("service-pdfs").upload(path, file, {
      contentType: "application/pdf", upsert: false,
    });
    if (upErr) { setUploading(false); setMsg("Erreur d'upload : " + upErr.message); return; }
    // delete previous file if any
    if (pdfPath) await supabase.storage.from("service-pdfs").remove([pdfPath]);
    const { error: dbErr } = await supabase.from("services").update({ pdf_path: path }).eq("id", service.id);
    setUploading(false);
    if (dbErr) { setMsg("Erreur DB : " + dbErr.message); return; }
    setPdfPath(path);
    setMsg("PDF mis à jour.");
    onChange();
  }

  async function deletePdf() {
    if (!pdfPath) return;
    if (!confirm("Supprimer le PDF de ce service ?")) return;
    await supabase.storage.from("service-pdfs").remove([pdfPath]);
    await supabase.from("services").update({ pdf_path: null }).eq("id", service.id);
    setPdfPath(null);
    setMsg("PDF supprimé.");
    onChange();
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-background/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{String(service.display_order).padStart(2, "0")}</span>
          <div className="min-w-0">
            <div className="font-medium truncate">{service.title}</div>
            <div className="text-xs text-muted-foreground truncate">/{service.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {pdfPath && <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-primary"><FileText className="size-3.5" /> PDF</span>}
          {service.is_published
            ? <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"><Eye className="size-3.5" /> Publié</span>
            : <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><EyeOff className="size-3.5" /> Brouillon</span>}
          <span className="text-muted-foreground text-sm">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-5 md:p-7 space-y-5 bg-background/40">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Titre" value={title} onChange={setTitle} />
            <Field label="Ordre d'affichage" type="number" value={String(order)} onChange={(v) => setOrder(parseInt(v) || 0)} />
          </div>
          <Field label="Description courte" value={shortDesc} onChange={setShortDesc} textarea rows={2} />
          <Field label="Description longue" value={longDesc} onChange={setLongDesc} textarea rows={5} />

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4 accent-primary" />
            Publié sur le site
          </label>

          <div className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-2"><FileText className="size-4 text-primary" /> Fiche d&rsquo;offre PDF</div>
                {pdfUrl ? (
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                    Ouvrir le PDF actuel <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">Aucun PDF pour ce service.</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-background transition-colors ${uploading ? "opacity-60" : ""}`}>
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {pdfPath ? "Remplacer" : "Téléverser"}
                  <input type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} disabled={uploading} />
                </label>
                {pdfPath && (
                  <button onClick={deletePdf} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="size-4" /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <button
              onClick={save}
              disabled={saving}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", textarea, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      )}
    </label>
  );
}
