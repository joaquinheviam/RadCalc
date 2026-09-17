import { useState, useEffect } from 'react';

// Aviso no bloqueante que invita a donar cada cierto número de visitas
// (contadas en localStorage, sin backend ni contador visible). Umbrales:
// 30, 60, 100 y luego cada 100 adicionales (130, 160, 200, 230, 260, 300...),
// vía el resto de newCount % 100. Quien marca "Ya doné" no vuelve a verlo
// nunca más; quien elige "Más adelante" solo cierra el aviso actual y lo
// vuelve a ver naturalmente en el próximo hito.
export function useDonationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1. Si ya donó en el pasado, abortar silenciosamente.
    const hasDonated = localStorage.getItem('radiocalc_has_donated') === 'true';
    if (hasDonated) return;

    // 2. Leer e incrementar el contador de visitas.
    const currentCount = parseInt(localStorage.getItem('radiocalc_visit_count') || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem('radiocalc_visit_count', newCount.toString());

    // 3. Evaluar umbrales (30, 60, 100, 130, 160, 200, etc.).
    const remainder = newCount % 100;
    if (newCount > 0 && (remainder === 30 || remainder === 60 || remainder === 0)) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
  };

  const markDonated = () => {
    localStorage.setItem('radiocalc_has_donated', 'true');
    setShow(false);
  };

  return { show, dismiss, markDonated };
}
