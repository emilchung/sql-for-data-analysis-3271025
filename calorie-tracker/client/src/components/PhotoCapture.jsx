import { useRef, useState } from 'react'
import { analyzePhoto, fileToBase64 } from '../api'

export default function PhotoCapture({ onAnalyzed }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | analyzing | error
  const [errorMessage, setErrorMessage] = useState('')

  async function handleFileSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setStatus('analyzing')
    setErrorMessage('')

    try {
      const base64 = await fileToBase64(file)
      const result = await analyzePhoto({ base64, mediaType: file.type || 'image/jpeg' })
      setStatus('idle')
      onAnalyzed(result)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong analyzing that photo.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="card capture-card">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        hidden
      />

      {previewUrl && (
        <img src={previewUrl} alt="Captured food" className="preview-thumb" />
      )}

      <button
        type="button"
        className="primary-button"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'analyzing'}
      >
        {status === 'analyzing' ? 'Analyzing photo…' : '📷 Snap your food'}
      </button>

      {status === 'error' && <p className="error-text">{errorMessage}</p>}
    </div>
  )
}
