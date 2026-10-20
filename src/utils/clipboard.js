/**
 * Copy text to clipboard.
 * Falls back to a hidden textarea + execCommand for older / restricted browsers.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
