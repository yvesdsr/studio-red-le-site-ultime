// Receives an admin access request, stores it, and notifies the owner by email.
// Email delivery uses FormSubmit (no API key required) — avoids needing Resend/SMTP secrets.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const OWNER_EMAIL = "snowdenyves@gmail.com";

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
    const body = await req.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const email = String(body.email ?? "").trim();
    const fullName = String(body.full_name ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (username.length < 3 || username.length > 60 || !/^[a-z0-9._-]+$/i.test(username)) {
      return Response.json({ ok: false, error: "Identifiant invalide." }, { status: 400, headers: corsHeaders });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      return Response.json({ ok: false, error: "Email invalide." }, { status: 400, headers: corsHeaders });
    }
    if (message.length > 2000 || fullName.length > 200) {
      return Response.json({ ok: false, error: "Champs trop longs." }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: insertErr } = await supabaseAdmin.from("admin_requests").insert({
      username, email, full_name: fullName || null, message: message || null, status: "pending",
    });
    if (insertErr) {
      return Response.json({ ok: false, error: insertErr.message }, { status: 500, headers: corsHeaders });
    }

    // Fire-and-forget email notification via FormSubmit AJAX endpoint
    try {
      await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `RED STUDIO — Nouvelle demande d'accès admin (${username})`,
          _template: "table",
          Identifiant: username,
          Email: email,
          Nom: fullName || "—",
          Message: message || "—",
          Action: "Connectez-vous au panneau admin pour approuver ou refuser.",
        }),
      });
    } catch (_) {
      // Non bloquant : la demande est déjà enregistrée et visible dans l'admin.
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500, headers: corsHeaders });
  }
});
