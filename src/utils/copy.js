export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {}
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  document.body.removeChild(ta)
  return ok
}

export function htmlToPlainText(maybeHtml) {
  if (typeof maybeHtml !== 'string') return ''
  if (maybeHtml.includes('<')) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(maybeHtml, 'text/html')
    return (doc.body?.textContent || '').trim()
  }
  return maybeHtml.trim()
}
