/**
 * Copy text to clipboard.
 * Falls back to a hidden textarea + execCommand for older / restricted browsers.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some browsers expose the API but reject writes because of permissions.
    }
  }

  const ta = document.createElement('textarea');
  try {
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    if (!document.execCommand('copy')) {
      throw new Error('Clipboard copy was rejected.');
    }
  } finally {
    ta.remove();
  }
}
