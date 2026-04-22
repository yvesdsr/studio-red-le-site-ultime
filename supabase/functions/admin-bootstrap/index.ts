// Bootstraps the initial admin account (username: yvesdsr).
// Idempotent: safe to call multiple times. Uses service role.
// CORS open: only creates the seed account if it does not exist yet.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SEED_USERNAME = "yvesdsr";
const SEED_EMAIL = "yvesdsr@admin.redstudio.local";
const SEED_PASSWORD = "Celestinviviane2001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    // 1. Check if admin profile already exists
    const { data: existing } = await supabaseAdmin
      .from("admin_profiles")
      .select("user_id, username")
      .eq("username", SEED_USERNAME)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { ok: true, message: "Admin déjà initialisé.", username: SEED_USERNAME },
        { headers: corsHeaders }
      );
    }

    // 2. Create the auth user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { username: SEED_USERNAME, display_name: "Yves Snowden" },
    });

    let userId = created?.user?.id;
    if (createErr || !userId) {
      // Maybe user already exists in auth — find by email
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const found = list.users.find((u) => u.email === SEED_EMAIL);
      if (!found) {
        return Response.json(
          { ok: false, error: createErr?.message ?? "Création impossible" },
          { status: 500, headers: corsHeaders }
        );
      }
      userId = found.id;
    }

    // 3. Insert admin profile (username mapping)
    await supabaseAdmin.from("admin_profiles").upsert(
      { user_id: userId, username: SEED_USERNAME, display_name: "Yves Snowden" },
      { onConflict: "user_id" }
    );

    // 4. Grant admin role
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    return Response.json(
      { ok: true, message: "Admin créé.", username: SEED_USERNAME },
      { headers: corsHeaders }
    );
  } catch (e) {
    return Response.json(
      { ok: false, error: (e as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
});
