import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import {
  Lock, LogOut, Save, Upload, Trash2, ExternalLink, FileText, Eye, EyeOff,
  Loader2, ArrowLeft, Plus, LayoutDashboard, Briefcase, Image as ImageIcon, Users, Inbox, Mail, Check, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import logo from "@/assets/red-studio-logo.png";
import type { Service } from "@/lib/services";
import {
  fetchAllRealisationsAdmin, fetchAllClientsAdmin, getRealisationAssetUrl, getClientLogoUrl,
  REALISATION_BUCKET, CLIENT_LOGO_BUCKET, type Realisation, type Client,
} from "@/lib/realisations";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — RED STUDIO" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

type Tab = "dashboard" | "services" | "realisations" | "clients" | "requests" | "messages";

function AdminPage() {
  const { loading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }
  if (!user) return null;
  if (!isAdmin) return <NotAuthorized email={user.email ?? ""} />;
  return <AdminDashboard email={user.email ?? ""} />;
}

function NotAuthorized({ email }: { email: string }) {
  async function logout() { await supabase.auth.signOut(); window.location.href = "/admin/login"; }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="size-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center mb-4"><Lock className="size-5" /></div>
        <h1 className="display-md text-2xl mb-3">Accès non autorisé</h1>
        <p className="text-muted-foreground mb-6">Le compte <span className="font-medium text-foreground">{email}</span> n&rsquo;a pas le rôle administrateur.</p>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors">
          <LogOut className="size-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  async function logout() { await supabase.auth.signOut(); window.location.href = "/"; }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "services", label: "Services & PDFs", icon: Briefcase },
    { id: "realisations", label: "Réalisations", icon: ImageIcon },
    { id: "clients", label: "Clients / Confiance", icon: Users },
    { id: "requests", label: "Demandes d'accès", icon: Inbox },
    { id: "messages", label: "Messages reçus", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-rs py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Site"><img src={logo} alt="RED STUDIO" className="h-10 w-auto" /></Link>
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

      <div className="container-rs py-6">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3 mb-6">
          {TABS.map((t) => {
            const I = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground hover:bg-card"
                }`}
              >
                <I className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <main>
          {tab === "dashboard" && <DashboardHome email={email} onNav={setTab} />}
          {tab === "services" && <ServicesModule />}
          {tab === "realisations" && <RealisationsModule />}
          {tab === "clients" && <ClientsModule />}
          {tab === "requests" && <RequestsModule />}
          {tab === "messages" && <MessagesModule />}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ email, onNav }: { email: string; onNav: (t: Tab) => void }) {
  const [counts, setCounts] = useState({ services: 0, realisations: 0, clients: 0, pending: 0, messages: 0 });
  useEffect(() => {
    (async () => {
      const [s, r, c, p, m] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("realisations").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("admin_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ services: s.count ?? 0, realisations: r.count ?? 0, clients: c.count ?? 0, pending: p.count ?? 0, messages: m.count ?? 0 });
    })();
  }, []);
  const cards: { label: string; value: number; tab: Tab }[] = [
    { label: "Services", value: counts.services, tab: "services" },
    { label: "Réalisations", value: counts.realisations, tab: "realisations" },
    { label: "Clients", value: counts.clients, tab: "clients" },
    { label: "Demandes en attente", value: counts.pending, tab: "requests" },
    { label: "Messages reçus", value: counts.messages, tab: "messages" },
  ];
  return (
    <div>
      <span className="eyebrow text-primary">Bienvenue</span>
      <h1 className="display-lg mt-3">Tableau de bord</h1>
      <p className="mt-2 text-muted-foreground">Connecté : <span className="text-foreground">{email}</span></p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNav(c.tab)}
            className="text-left bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors"
          >
            <div className="text-3xl font-display">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== SERVICES ==================== */
function ServicesModule() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const { data } = await supabase.from("services").select("*").order("display_order", { ascending: true });
    setServices((data ?? []) as Service[]); setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return (
    <div>
      <h2 className="display-md mb-2">Services & fiches PDF</h2>
      <p className="text-muted-foreground mb-6">Modifiez le contenu de chaque service et gérez les fiches PDF téléchargeables.</p>
      {loading ? <Loader2 className="size-4 animate-spin" /> : (
        <div className="space-y-4">{services.map((s) => <ServiceRow key={s.id} service={s} onChange={refresh} />)}</div>
      )}
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
    const { error } = await supabase.from("services").update({
      title, short_description: shortDesc, long_description: longDesc, is_published: published, display_order: order,
    }).eq("id", service.id);
    setSaving(false);
    if (error) { setMsg("Erreur : " + error.message); return; }
    setMsg("Enregistré."); onChange(); setTimeout(() => setMsg(null), 2000);
  }
  async function uploadPdf(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== "application/pdf") { setMsg("Le fichier doit être un PDF."); return; }
    if (file.size > 15 * 1024 * 1024) { setMsg("Fichier trop lourd (15 Mo max)."); return; }
    setUploading(true); setMsg(null);
    const path = `${service.slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("service-pdfs").upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upErr) { setUploading(false); setMsg("Erreur d'upload : " + upErr.message); return; }
    if (pdfPath) await supabase.storage.from("service-pdfs").remove([pdfPath]);
    await supabase.from("services").update({ pdf_path: path }).eq("id", service.id);
    setUploading(false); setPdfPath(path); setMsg("PDF mis à jour."); onChange();
  }
  async function deletePdf() {
    if (!pdfPath || !confirm("Supprimer le PDF ?")) return;
    await supabase.storage.from("service-pdfs").remove([pdfPath]);
    await supabase.from("services").update({ pdf_path: null }).eq("id", service.id);
    setPdfPath(null); setMsg("PDF supprimé."); onChange();
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-background/40 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{String(service.display_order).padStart(2, "0")}</span>
          <div className="min-w-0"><div className="font-medium truncate">{service.title}</div><div className="text-xs text-muted-foreground truncate">/{service.slug}</div></div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {pdfPath && <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-primary"><FileText className="size-3.5" /> PDF</span>}
          {service.is_published ? <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"><Eye className="size-3.5" /> Publié</span> : <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><EyeOff className="size-3.5" /> Brouillon</span>}
          <span className="text-muted-foreground text-sm">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border p-5 md:p-7 space-y-5 bg-background/40">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Titre" value={title} onChange={setTitle} />
            <TextField label="Ordre" type="number" value={String(order)} onChange={(v) => setOrder(parseInt(v) || 0)} />
          </div>
          <TextField label="Description courte" value={shortDesc} onChange={setShortDesc} textarea rows={2} />
          <TextField label="Description longue" value={longDesc} onChange={setLongDesc} textarea rows={5} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4 accent-primary" /> Publié
          </label>
          <div className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-medium flex items-center gap-2"><FileText className="size-4 text-primary" /> Fiche PDF</div>
                {pdfUrl ? <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">Ouvrir le PDF <ExternalLink className="size-3" /></a> : <div className="text-xs text-muted-foreground mt-1">Aucun PDF</div>}
              </div>
              <div className="flex items-center gap-2">
                <label className={`inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-background transition-colors ${uploading ? "opacity-60" : ""}`}>
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{pdfPath ? "Remplacer" : "Téléverser"}
                  <input type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} disabled={uploading} />
                </label>
                {pdfPath && <button onClick={deletePdf} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="size-4" /> Supprimer</button>}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <button onClick={save} disabled={saving} className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== REALISATIONS ==================== */
const REALISATION_CATEGORIES = [
  "Identité visuelle", "Documents institutionnels", "Plaquettes & brochures",
  "Supports imprimés", "Sites internet", "UI/UX", "Community management",
  "Publicité digitale", "Vidéo", "IA créative",
];

function RealisationsModule() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { setItems(await fetchAllRealisationsAdmin()); setLoading(false); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function add() {
    const slug = `nouvelle-realisation-${Date.now()}`;
    const { error } = await supabase.from("realisations").insert({
      slug, title: "Nouvelle réalisation", category: REALISATION_CATEGORIES[0],
      display_order: items.length + 1, is_published: false,
    });
    if (!error) refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="display-md">Réalisations</h2>
          <p className="text-muted-foreground">Ajoutez et gérez les projets affichés dans le portfolio.</p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> Nouvelle réalisation
        </button>
      </div>
      {loading ? <Loader2 className="size-4 animate-spin" /> : (
        <div className="space-y-4">{items.map((r) => <RealisationRow key={r.id} item={r} onChange={refresh} />)}</div>
      )}
    </div>
  );
}

function RealisationRow({ item, onChange }: { item: Realisation; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(item);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function setField<K extends keyof Realisation>(k: K, val: Realisation[K]) { setV((p) => ({ ...p, [k]: val })); }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("realisations").update({
      slug: v.slug, title: v.title, category: v.category, client_name: v.client_name,
      description: v.description, before_text: v.before_text, after_text: v.after_text,
      impact: v.impact, external_link: v.external_link, display_order: v.display_order,
      is_featured: v.is_featured, is_published: v.is_published,
    }).eq("id", item.id);
    setSaving(false);
    setMsg(error ? "Erreur : " + error.message : "Enregistré.");
    if (!error) { onChange(); setTimeout(() => setMsg(null), 2000); }
  }
  async function uploadCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const path = `${v.slug}/cover-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from(REALISATION_BUCKET).upload(path, file, { upsert: false });
    if (!upErr) {
      await supabase.from("realisations").update({ cover_image_url: path }).eq("id", item.id);
      setField("cover_image_url", path);
    } else setMsg(upErr.message);
    setUploading(false); onChange();
  }
  async function uploadPdf(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== "application/pdf") { setMsg("Doit être un PDF"); return; }
    const path = `${v.slug}/doc-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await supabase.storage.from(REALISATION_BUCKET).upload(path, file, { contentType: "application/pdf" });
    await supabase.from("realisations").update({ pdf_path: path }).eq("id", item.id);
    setField("pdf_path", path); onChange();
  }
  async function remove() {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await supabase.from("realisations").delete().eq("id", item.id);
    onChange();
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-background/40">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-muted-foreground w-6">{String(item.display_order).padStart(2, "0")}</span>
          <div className="min-w-0">
            <div className="font-medium truncate">{item.title}</div>
            <div className="text-xs text-muted-foreground truncate">{item.category} · {item.client_name ?? "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {item.is_published ? <Eye className="size-4 text-green-600" /> : <EyeOff className="size-4 text-muted-foreground" />}
          <span className="text-muted-foreground text-sm">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border p-5 md:p-7 space-y-4 bg-background/40">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Titre" value={v.title} onChange={(x) => setField("title", x)} />
            <TextField label="Slug" value={v.slug} onChange={(x) => setField("slug", x)} />
            <label className="block">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Catégorie</span>
              <select value={v.category} onChange={(e) => setField("category", e.target.value)} className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {REALISATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <TextField label="Client" value={v.client_name ?? ""} onChange={(x) => setField("client_name", x)} />
            <TextField label="Lien externe" value={v.external_link ?? ""} onChange={(x) => setField("external_link", x)} />
            <TextField label="Ordre" type="number" value={String(v.display_order)} onChange={(x) => setField("display_order", parseInt(x) || 0)} />
          </div>
          <TextField label="Description" value={v.description ?? ""} onChange={(x) => setField("description", x)} textarea rows={3} />
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Avant" value={v.before_text ?? ""} onChange={(x) => setField("before_text", x)} textarea rows={3} />
            <TextField label="Après" value={v.after_text ?? ""} onChange={(x) => setField("after_text", x)} textarea rows={3} />
          </div>
          <TextField label="Impact / résultat" value={v.impact ?? ""} onChange={(x) => setField("impact", x)} textarea rows={2} />

          <div className="flex flex-wrap gap-4 items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.is_published} onChange={(e) => setField("is_published", e.target.checked)} className="size-4 accent-primary" /> Publiée
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} className="size-4 accent-primary" /> Mise en avant
            </label>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-background">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />} Image de couverture
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-background">
              <FileText className="size-4" /> PDF associé
              <input type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} />
            </label>
            {v.cover_image_url && <a href={getRealisationAssetUrl(v.cover_image_url) ?? "#"} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Voir image</a>}
          </div>

          <div className="flex items-center justify-between gap-3">
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <div className="ml-auto flex gap-2">
              <button onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /> Supprimer</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== CLIENTS ==================== */
function ClientsModule() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { setItems(await fetchAllClientsAdmin()); setLoading(false); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function add() {
    await supabase.from("clients").insert({ name: "Nouveau client", display_order: items.length + 1, is_visible: true });
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="display-md">Clients — Ils nous font confiance</h2>
          <p className="text-muted-foreground">Ajoutez les marques affichées dans la section confiance.</p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"><Plus className="size-4" /> Nouveau client</button>
      </div>
      {loading ? <Loader2 className="size-4 animate-spin" /> : (
        <div className="space-y-4">{items.map((c) => <ClientRow key={c.id} item={c} onChange={refresh} />)}</div>
      )}
    </div>
  );
}

function ClientRow({ item, onChange }: { item: Client; onChange: () => void }) {
  const [v, setV] = useState(item);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  function setField<K extends keyof Client>(k: K, val: Client[K]) { setV((p) => ({ ...p, [k]: val })); }

  async function save() {
    setSaving(true);
    await supabase.from("clients").update({
      name: v.name, summary: v.summary, link: v.link, display_order: v.display_order, is_visible: v.is_visible,
    }).eq("id", item.id);
    setSaving(false); onChange();
  }
  async function uploadLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const path = `${item.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(CLIENT_LOGO_BUCKET).upload(path, file);
    if (!error) {
      await supabase.from("clients").update({ logo_url: path }).eq("id", item.id);
      setField("logo_url", path);
    }
    setUploading(false); onChange();
  }
  async function remove() {
    if (!confirm("Supprimer ce client ?")) return;
    await supabase.from("clients").delete().eq("id", item.id);
    onChange();
  }

  const logoUrl = getClientLogoUrl(v.logo_url);
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start">
      <div className="size-16 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
        {logoUrl ? <img src={logoUrl} alt={v.name} className="max-h-full max-w-full object-contain" /> : <Building2Icon />}
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-3 w-full">
        <TextField label="Nom" value={v.name} onChange={(x) => setField("name", x)} />
        <TextField label="Ordre" type="number" value={String(v.display_order)} onChange={(x) => setField("display_order", parseInt(x) || 0)} />
        <TextField label="Lien (optionnel)" value={v.link ?? ""} onChange={(x) => setField("link", x)} />
        <label className="inline-flex items-center gap-2 text-sm self-end">
          <input type="checkbox" checked={v.is_visible} onChange={(e) => setField("is_visible", e.target.checked)} className="size-4 accent-primary" /> Visible
        </label>
        <div className="md:col-span-2"><TextField label="Résumé" value={v.summary ?? ""} onChange={(x) => setField("summary", x)} textarea rows={2} /></div>
      </div>
      <div className="flex md:flex-col gap-2 shrink-0">
        <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm cursor-pointer hover:bg-background">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Logo
          <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
        </label>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90 disabled:opacity-60">
          <Save className="size-4" /> Enregistrer
        </button>
        <button onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}

function Building2Icon() {
  return <svg className="size-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /></svg>;
}

/* ==================== ADMIN REQUESTS ==================== */
function RequestsModule() {
  const [items, setItems] = useState<{ id: string; username: string; email: string; full_name: string | null; message: string | null; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const { data } = await supabase.from("admin_requests").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as typeof items); setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function decide(id: string, decision: "approved" | "rejected") {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-request-decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ request_id: id, decision }),
    });
    refresh();
  }

  return (
    <div>
      <h2 className="display-md mb-2">Demandes d&rsquo;accès admin</h2>
      <p className="text-muted-foreground mb-6">Approuvez ou refusez les nouveaux comptes administrateurs. Une notification email est envoyée à <strong>snowdenyves@gmail.com</strong> à chaque nouvelle demande.</p>
      {loading ? <Loader2 className="size-4 animate-spin" /> : items.length === 0 ? (
        <p className="text-muted-foreground">Aucune demande pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">{r.full_name ?? r.username} <span className="text-muted-foreground">· @{r.username}</span></div>
                <div className="text-sm text-muted-foreground">{r.email}</div>
                {r.message && <p className="text-sm mt-2 text-foreground/80">{r.message}</p>}
                <div className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString("fr-FR")}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === "pending" ? "bg-yellow-500/10 text-yellow-600" : r.status === "approved" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>{r.status}</span>
                {r.status === "pending" && (
                  <>
                    <button onClick={() => decide(r.id, "approved")} className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs hover:bg-primary/90"><Check className="size-3.5" /> Approuver</button>
                    <button onClick={() => decide(r.id, "rejected")} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-card"><X className="size-3.5" /> Refuser</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== MESSAGES ==================== */
function MessagesModule() {
  const [items, setItems] = useState<{ id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      setItems((data ?? []) as typeof items); setLoading(false);
    })();
  }, []);
  return (
    <div>
      <h2 className="display-md mb-2">Messages reçus</h2>
      <p className="text-muted-foreground mb-6">Sauvegarde de tous les messages soumis depuis le formulaire de contact (envoyés également par email à snowdenyves@gmail.com).</p>
      {loading ? <Loader2 className="size-4 animate-spin" /> : items.length === 0 ? (
        <p className="text-muted-foreground">Aucun message pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.email}{m.phone ? ` · ${m.phone}` : ""}</div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</div>
              </div>
              {m.subject && <div className="mt-3 text-sm font-medium">{m.subject}</div>}
              <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== Field ==================== */
function TextField({
  label, value, onChange, type = "text", textarea, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      )}
    </label>
  );
}
