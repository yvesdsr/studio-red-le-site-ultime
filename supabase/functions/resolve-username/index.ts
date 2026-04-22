// Resolves a username to its internal email so the client can sign in
// with email+password through the standard Supabase auth flow.
// Public endpoint — only returns the email associated with an admin_profile,
// which is by design a stable internal alias (no PII leak).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    if (!username || typeof username !== "string" || username.length < 2 || username.length > 60) {
      return Response.json({ ok: false, error: "Identifiant invalide." }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: profile } = await supabaseAdmin
      .from("admin_profiles")
      .select("user_id")
      .eq("username", username.trim().toLowerCase())
      .maybeSingle();

    if (!profile) {
      return Response.json({ ok: false, error: "Identifiants invalides." }, { status: 404, headers: corsHeaders });
    }

    const { data: userResp } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
    if (!userResp?.user?.email) {
      return Response.json({ ok: false, error: "Compte introuvable." }, { status: 404, headers: corsHeaders });
    }

    return Response.json({ ok: true, email: userResp.user.email }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500, headers: corsHeaders });
  }
});
