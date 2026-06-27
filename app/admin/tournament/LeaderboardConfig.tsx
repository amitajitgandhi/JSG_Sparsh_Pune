'use client'

import { useEffect, useState } from 'react'

const INTERVAL_OPTIONS = [1, 2, 5, 10, 15, 30]

function SaveBanner({ msg }: { msg: string }) {
  if (!msg) return null
  const ok = msg.includes('✓') || msg.includes('successfully')
  return (
    <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
      {msg}
    </div>
  )
}

/**
 * Leaderboard auto-refresh + audio-alert configuration.
 * Relocated here from /admin/admin-config — this is tournament-leaderboard config,
 * and /admin/tournament is the permanent tool that survives across seasons.
 * Reads/writes the same /api/admin/leaderboard-config + /api/admin/upload-audio
 * endpoints and the same app_navigation_settings keys (no data/API change).
 */
export default function LeaderboardConfig() {
  const [arEnabled,      setArEnabled]      = useState(false)
  const [arInterval,     setArInterval]     = useState(5)
  const [arAudioEnabled, setArAudioEnabled] = useState(true)
  const [arAudioUrl,     setArAudioUrl]     = useState('/files/BELL.mp3')
  const [arLoading,      setArLoading]      = useState(true)
  const [arSaving,       setArSaving]       = useState(false)
  const [arMsg,          setArMsg]          = useState('')
  const [uploading,      setUploading]      = useState(false)
  const [uploadMsg,      setUploadMsg]      = useState('')

  const loadAutoRefresh = async () => {
    try {
      const res  = await fetch('/api/admin/leaderboard-config', { cache: 'no-store' })
      const data = await res.json()
      setArEnabled(!!data.enabled)
      setArInterval(data.intervalMins ?? 5)
      setArAudioEnabled(data.audioEnabled !== false)
      setArAudioUrl(data.audioUrl || '/files/BELL.mp3')
    } catch { /* keep defaults */ }
    finally { setArLoading(false) }
  }

  const uploadAudio = async (file: File) => {
    setUploading(true); setUploadMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/admin/upload-audio', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      setArAudioUrl(data.url)
      setUploadMsg(`Uploaded: ${file.name} ✓`)
      setTimeout(() => setUploadMsg(''), 4000)
    } catch (e: any) {
      setUploadMsg(e?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const previewAudio = () => {
    try { new Audio(arAudioUrl).play() } catch {}
  }

  const saveAutoRefresh = async () => {
    setArSaving(true); setArMsg('')
    try {
      const res  = await fetch('/api/admin/leaderboard-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: arEnabled, intervalMins: arInterval, audioEnabled: arAudioEnabled, audioUrl: arAudioUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      setArMsg('Saved successfully! ✓')
      setTimeout(() => setArMsg(''), 3000)
    } catch (e: any) {
      setArMsg(e?.message || 'Failed to save')
    } finally { setArSaving(false) }
  }

  useEffect(() => { loadAutoRefresh() }, [])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Leaderboard Auto-refresh</h2>
      <p className="mt-1 text-sm text-gray-600">
        When enabled, the leaderboard page automatically polls for new scores in the background.
      </p>

      <div className="mt-5 space-y-4">
        {/* Toggle */}
        <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-800">Auto-refresh</p>
            <p className="text-xs text-gray-500 mt-0.5">{arEnabled ? 'Enabled — leaderboard will refresh automatically' : 'Disabled — manual refresh only'}</p>
          </div>
          <button
            onClick={() => setArEnabled(v => !v)}
            disabled={arLoading || arSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${arEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${arEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>

        {/* Interval */}
        <div className={`rounded-xl border border-gray-200 p-4 ${!arEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <p className="text-sm font-semibold text-gray-800 mb-3">Refresh interval</p>
          <div className="flex flex-wrap gap-2">
            {INTERVAL_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => setArInterval(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${arInterval === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}
              >
                {m} min
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">Currently set to refresh every <strong>{arInterval} minute{arInterval !== 1 ? 's' : ''}</strong>.</p>
        </div>

        {/* Audio alert */}
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Play audio on refresh</p>
              <p className="text-xs text-gray-500 mt-0.5">Plays a bell sound each time the leaderboard refreshes</p>
            </div>
            <button
              onClick={() => setArAudioEnabled(v => !v)}
              disabled={arLoading || arSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${arAudioEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${arAudioEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className={arAudioEnabled ? '' : 'opacity-40 pointer-events-none'}>
            {/* Current file */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 flex-1 truncate">
                Current: <strong>{arAudioUrl === '/files/BELL.mp3' ? 'Default (BELL.mp3)' : arAudioUrl.split('/').pop()}</strong>
              </span>
              <button
                onClick={previewAudio}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex-shrink-0"
              >
                ▶ Preview
              </button>
              {arAudioUrl !== '/files/BELL.mp3' && (
                <button
                  onClick={() => setArAudioUrl('/files/BELL.mp3')}
                  className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 flex-shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Upload */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="flex-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition text-center">
                {uploading ? 'Uploading…' : 'Upload custom audio file (MP3, WAV — max 5 MB)'}
              </div>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                disabled={uploading || arSaving}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadAudio(f) }}
              />
            </label>
            {uploadMsg && (
              <p className={`mt-1.5 text-xs font-medium ${uploadMsg.includes('✓') ? 'text-green-700' : 'text-red-600'}`}>
                {uploadMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={saveAutoRefresh}
        disabled={arLoading || arSaving}
        className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {arSaving ? 'Saving…' : 'Save'}
      </button>
      <SaveBanner msg={arMsg} />
    </div>
  )
}
