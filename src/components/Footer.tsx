import { Link } from "@tanstack/react-router";
import { Lock, Instagram, Facebook, Linkedin, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import logo from "@/assets/red-studio-logo.png";
import { CONTACT, whatsappLink } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="ink-section relative overflow-hidden">
      <div className="container-rs py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5 space-y-6">
            <img src={logo} alt="RED STUDIO" className="h-16 md:h-20 w-auto bg-white rounded-md p-3" width={240} height={80} />
            <p className="text-white/70 text-lg max-w-md text-pretty">
              Studio créatif et agence de communication digitale basé à Abidjan.
              Nous donnons une image forte aux marques qui veulent compter.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialLink href="https://instagram.com" label="Instagram"><Instagram className="size-4" /></SocialLink>
              <SocialLink href="https://facebook.com" label="Facebook"><Facebook className="size-4" /></SocialLink>
              <SocialLink href="https://linkedin.com" label="LinkedIn"><Linkedin className="size-4" /></SocialLink>
              <SocialLink href={whatsappLink()} label="WhatsApp"><MessageCircle className="size-4" /></SocialLink>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="eyebrow text-white/50 mb-5">Navigation</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/realisations" className="hover:text-primary transition-colors">Réalisations</Link></li>
              <li><Link to="/confiance" className="hover:text-primary transition-colors">Ils nous font confiance</Link></li>
              <li><Link to="/a-propos" className="hover:text-primary transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="eyebrow text-white/50 mb-5">Contact</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3"><MapPin className="size-4 mt-1 text-primary shrink-0" /> {CONTACT.address}, {CONTACT.city}</li>
              <li className="flex items-start gap-3">
                <Phone className="size-4 mt-1 text-primary shrink-0" />
                <a href={`tel:${CONTACT.phoneRaw}`} className="hover:text-primary transition-colors">{CONTACT.phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="size-4 mt-1 text-primary shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-primary transition-colors break-all">{CONTACT.email}</a>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Parlons de votre projet
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} RED STUDIO — Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span>Studio créatif · Abidjan</span>
            <Link
              to="/admin/login"
              aria-label="Espace administrateur"
              title="Espace administrateur"
              className="p-2 rounded-full text-white/30 hover:text-primary hover:bg-white/5 transition-colors"
            >
              <Lock className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex items-center justify-center size-9 rounded-full border border-white/15 text-white/70 hover:text-primary hover:border-primary transition-colors"
    >
      {children}
    </a>
  );
}
