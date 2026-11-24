import { useLang } from '../../i18n/LangContext.js';

// Código QR (versión 2-M, 25x25 módulos) de https://radiocalc.app/. Reemplaza
// al botón de donación en la versión para intranet, donde los enlaces de pago
// no abren.
const QR_PATH = 'M0 0h7v1h-7zM8 0h1v1h-1zM12 0h2v1h-2zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h3v1h-3zM13 1h1v1h-1zM16 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM11 2h1v1h-1zM13 2h1v1h-1zM15 2h2v1h-2zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h4v1h-4zM13 3h3v1h-3zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM11 4h2v1h-2zM14 4h3v1h-3zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM11 5h1v1h-1zM13 5h1v1h-1zM16 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM8 7h1v1h-1zM11 7h1v1h-1zM16 7h1v1h-1zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM9 8h2v1h-2zM12 8h1v1h-1zM14 8h3v1h-3zM18 8h1v1h-1zM21 8h1v1h-1zM23 8h2v1h-2zM1 9h2v1h-2zM4 9h1v1h-1zM7 9h3v1h-3zM11 9h1v1h-1zM14 9h1v1h-1zM16 9h1v1h-1zM19 9h1v1h-1zM23 9h1v1h-1zM0 10h2v1h-2zM3 10h1v1h-1zM5 10h3v1h-3zM9 10h1v1h-1zM11 10h2v1h-2zM14 10h1v1h-1zM16 10h2v1h-2zM1 11h1v1h-1zM4 11h1v1h-1zM7 11h2v1h-2zM12 11h2v1h-2zM16 11h2v1h-2zM19 11h1v1h-1zM21 11h2v1h-2zM1 12h2v1h-2zM6 12h2v1h-2zM10 12h6v1h-6zM17 12h4v1h-4zM22 12h3v1h-3zM2 13h1v1h-1zM9 13h4v1h-4zM15 13h6v1h-6zM24 13h1v1h-1zM1 14h1v1h-1zM3 14h1v1h-1zM6 14h1v1h-1zM8 14h2v1h-2zM11 14h1v1h-1zM13 14h1v1h-1zM17 14h1v1h-1zM20 14h1v1h-1zM22 14h2v1h-2zM0 15h1v1h-1zM2 15h2v1h-2zM7 15h1v1h-1zM11 15h1v1h-1zM18 15h3v1h-3zM24 15h1v1h-1zM2 16h6v1h-6zM10 16h1v1h-1zM12 16h3v1h-3zM16 16h9v1h-9zM8 17h1v1h-1zM10 17h1v1h-1zM16 17h1v1h-1zM20 17h1v1h-1zM22 17h1v1h-1zM24 17h1v1h-1zM0 18h7v1h-7zM8 18h3v1h-3zM13 18h2v1h-2zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h3v1h-3zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h2v1h-2zM11 19h1v1h-1zM15 19h2v1h-2zM20 19h1v1h-1zM23 19h2v1h-2zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM9 20h1v1h-1zM13 20h1v1h-1zM16 20h6v1h-6zM23 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h1v1h-1zM16 21h3v1h-3zM20 21h5v1h-5zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM8 22h2v1h-2zM14 22h5v1h-5zM20 22h1v1h-1zM22 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM11 23h3v1h-3zM18 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM0 24h7v1h-7zM8 24h5v1h-5zM17 24h8v1h-8z';

export default function IntranetQr() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center gap-2 py-1 text-center">
      <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t.common.intranetQrText}</div>
      <svg viewBox="-4 -4 33 33" width="132" height="132" role="img" aria-label={t.common.intranetQrAria} shapeRendering="crispEdges" className="rounded-lg">
        <rect x="-4" y="-4" width="33" height="33" fill="#fff" />
        <path d={QR_PATH} fill="#000" />
      </svg>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">radiocalc.app</div>
    </div>
  );
}
