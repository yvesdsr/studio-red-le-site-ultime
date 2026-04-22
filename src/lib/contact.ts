// Coordonnées officielles RED STUDIO — utilisées partout sur le site.
export const CONTACT = {
  phone: "+225 07 13 62 18 98",
  phoneRaw: "+2250713621898",
  whatsappNumber: "2250713621898",
  email: "snowdenyves@gmail.com",
  address: "Cocody Deux Plateaux, 300 m de Sococé",
  city: "Abidjan, Côte d'Ivoire",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
