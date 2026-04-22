import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string | null;
  icon: string | null;
  image_url: string | null;
  pdf_path: string | null;
  display_order: number;
  is_published: boolean;
};

export async function fetchPublishedServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Service | null) ?? null;
}

export function getPdfPublicUrl(pdfPath: string | null): string | null {
  if (!pdfPath) return null;
  const { data } = supabase.storage.from("service-pdfs").getPublicUrl(pdfPath);
  return data.publicUrl;
}
