import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/red-studio-logo.png";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/realisations", label: "Réalisations" },
  { to: "/confiance", label: "Ils nous font confiance" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-rs flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="RED STUDIO"
            className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105"
            width={160}
            height={40}
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-primary" />
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
          >
            Demander un devis
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 -mr-2 text-foreground"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-background border-b border-border ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container-rs py-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="py-3 text-lg font-medium text-foreground/80 border-b border-border/60"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </header>
  );
}
