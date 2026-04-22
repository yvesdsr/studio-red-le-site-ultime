import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/contact";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Bonjour RED STUDIO, je souhaite échanger sur un projet.")}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:scale-105 transition-transform"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
    </a>
  );
}
