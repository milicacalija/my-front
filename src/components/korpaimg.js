// korpaimg.js
export function getImageUrl(item) {
  if (!item || !item.pro_iupac) {
    // fallback slika ako nema naziv
    return '/images/korpica.png';
  }

  // ✨ Čišćenje naziva
  let proIupac = item.pro_iupac.trim();

  // Ako je stari naziv, zameni ga novim
  if (proIupac.toLowerCase() === 'bor trifluorid') {
    proIupac = 'Etilamin bor trifluorid kompleks';
  }

  const safeName = encodeURIComponent(proIupac) + '.jpg';
  const timestamp = Date.now(); // opcionalno: za osvežavanje slike

  return `/images/${safeName}?ts=${timestamp}`;
}




