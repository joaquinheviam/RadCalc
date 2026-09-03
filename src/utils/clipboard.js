export const copyToClipboard = async (text, msgOk, msgErr) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(msgOk);
  } catch (err) {
    alert(msgErr);
  }
};
