const API_BASE = import.meta.env.VITE_API_URL || ''

export async function analyzePhoto({ base64, mediaType }) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, mediaType }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Analyze request failed (${response.status})`)
  }

  return response.json()
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const [, base64] = reader.result.split(',')
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
