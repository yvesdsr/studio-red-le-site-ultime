// Approve or reject an admin access request. Caller must be authenticated AND be admin.
// On approval: creates the auth user (random temp password), maps the username,
// grants 'admin' role, and emails the requester their temporary password via FormSubmit.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function tempPassword() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const b = "abcdefghijkmnpqrstuvwxyz";
  const n = "23456789";
  const s = "!@#$%&*";
  const all = a + b + n + s;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  let p = pick(a) + pick(b) + pick(n) + pick(s);
  for (let i = 0; i < 10; i++) p += pick(all);
  return p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: roleRow } = await admin
    .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
  if (!roleRow) return new Response("Forbidden", { status: 403, headers: corsHeaders });

  try {
    const { request_id, decision } = await req.json();
    if (!request_id || !["approved", "rejected"].includes(decision)) {
      return Response.json({ ok: false, error: "Paramètres invalides." }, { status: 400, headers: corsHeaders });
    }

    const { data: request } = await admin.from("admin_requests").select("*").eq("id", request_id).maybeSingle();
    if (!request) return Response.json({ ok: false, error: "Demande introuvable." }, { status: 404, headers: corsHeaders });

    if (decision === "rejected") {
      await admin.from("admin_requests").update({
        status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: userData.user.id,
      }).eq("id", request_id);
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // Approval flow
    const internalEmail = `${request.username}@admin.redstudio.local`;
    const password = tempPassword();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: internalEmail, password, email_confirm: true,
      user_metadata: { username: request.username, contact_email: request.email },
    });

    let userId = created?.user?.id;
    if (createErr || !userId) {
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list.users.find((u) => u.email === internalEmail);
      if (!found) return Response.json({ ok: false, error: createErr?.message ?? "Création échouée" }, { status: 500, headers: corsHeaders });
      userId = found.id;
      await admin.auth.admin.updateUserById(userId, { password });
    }

    await admin.from("admin_profiles").upsert(
      { user_id: userId, username: request.username, display_name: request.full_name ?? request.username },
      { onConflict: "user_id" }
    );
    await admin.from("user_roles").upsert(
      { user_id: userId, role: "admin" }, { onConflict: "user_id,role" }
    );
    await admin.from("admin_requests").update({
      status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userData.user.id,
    }).eq("id", request_id);

    // Notify the requester with their credentials
    try {
      await fetch(`https://formsubmit.co/ajax/${request.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "RED STUDIO — Votre accès administrateur a été activé",
          _template: "table",
          Identifiant: request.username,
          "Mot de passe temporaire": password,
          Connexion: "Rendez-vous sur le site, cliquez sur le cadenas dans le pied de page.",
          "Important": "Changez ce mot de passe dès votre première connexion (à venir prochainement).",
        }),
      });
    } catch (_) { /* non blocking */ }

    return Response.json({ ok: true, password }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500, headers: corsHeaders });
  }
});
