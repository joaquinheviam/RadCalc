// Inicialización de Google Analytics (GA4). Se mantiene en un archivo
// separado (en vez de un <script> inline en index.html) para poder aplicar
// una Content-Security-Policy estricta sin necesidad de 'unsafe-inline' en
// script-src.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-RZH36H9W2N');
