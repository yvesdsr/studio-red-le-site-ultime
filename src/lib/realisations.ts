import { supabase } from "@/integrations/supabase/client";

export type Realisation = {
  id: string;
  slug: string;
  title: string;
  category: string;
  client_name: string | null;
  cover_image_url: string | null;
  gallery: string[];
  description: string | null;
  before_text: string | null;
  after_text: string | null;
  impact: string | null;
  external_link: string | null;
  pdf_path: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string | null;
  summary: string | null;
  link: string | null;
  display_order: number;
  is_visible: boolean;
};

const BUCKET = "realisation-assets";
const LOGO_BUCKET = "client-logos";

export async function fetchRealisations(): Promise<Realisation[]> {
  const { data, error } = await supabase
    .from("realisations")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchAllRealisationsAdmin(): Promise<Realisation[]> {
  const { data, error } = await supabase
    .from("realisations")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchRealisationBySlug(slug: string): Promise<Realisation | null> {
  const { data, error } = await supabase.from("realisations").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function fetchAllClientsAdmin(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Client[];
}

export function getRealisationAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function getClientLogoUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function normalize(row: Record<string, unknown>): Realisation {
  return {
    ...(row as Realisation),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
  };
}

export const REALISATION_BUCKET = BUCKET;
export const CLIENT_LOGO_BUCKET = LOGO_BUCKET;
