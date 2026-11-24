// navigator.clipboard solo existe en HTTPS o localhost. En HTTP (p. ej. una
// intranet) se usa el método antiguo, con un <textarea> temporal.
function legacyCopy(text) {
  const previous = document.activeElement;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  try {
    area.select();
    if (!document.execCommand('copy')) throw new Error('copy failed');
  } finally {
    area.remove();
    if (previous && previous.focus) previous.focus();
  }
}

export const copyToClipboard = async (text, msgOk, msgErr) => {
  try {
    if (navigator.clipboard) await navigator.clipboard.writeText(text);
    else legacyCopy(text);
    alert(msgOk);
  } catch (err) {
    alert(msgErr);
  }
};
