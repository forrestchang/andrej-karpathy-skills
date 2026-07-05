import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (!offline) return null
  return (
    <div className="bg-amber-500 text-white text-sm text-center py-1.5 px-4 sticky top-0 z-50">
      ⚠️ 離線模式 — 資料將在網路恢復後同步
    </div>
  )
}
