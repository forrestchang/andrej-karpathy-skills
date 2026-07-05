import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import { useAuth } from '../contexts/AuthContext'
import { useFarm } from '../contexts/FarmContext'
import { supabase } from '../lib/supabase'

const AUTOMATION_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/automation-ingest`

function AutomationSection({ farmId }) {
  const [config, setConfig] = useState(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('farm_automation').select('*').eq('farm_id', farmId).maybeSingle()
      .then(({ data }) => {
        setConfig(data)
        setWebhookUrl(data?.sheet_webhook_url || '')
        setGeminiKey(data?.gemini_api_key || '')
      })
  }, [farmId])

  const enable = async () => {
    setBusy(true)
    try {
      const { data, error } = await supabase.from('farm_automation').insert({ farm_id: farmId }).select().single()
      if (error) throw error
      setConfig(data)
    } catch (err) { alert(err.message) }
    finally { setBusy(false) }
  }

  const saveSettings = async () => {
    setBusy(true)
    try {
      const { error } = await supabase.from('farm_automation')
        .update({
          sheet_webhook_url: webhookUrl.trim() || null,
          gemini_api_key: geminiKey.trim() || null,
        }).eq('farm_id', farmId)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { alert(err.message) }
    finally { setBusy(false) }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="font-bold text-gray-700 mb-1">自動化系統對接</h2>
      <p className="text-xs text-gray-400 mb-3">供溫室自動化控制系統（澆灌、施肥、抽風等）自動寫入農事記錄與產銷履歷試算表</p>

      {!config ? (
        <button onClick={enable} disabled={busy}
          className="w-full border-2 border-green-600 text-green-600 rounded-xl py-3 font-semibold disabled:opacity-50">
          {busy ? '產生中...' : '產生 API 金鑰並啟用'}
        </button>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="text-gray-500 mb-1">API 端點</p>
            <p className="font-mono text-xs bg-gray-50 rounded-lg p-2 break-all select-all">{AUTOMATION_ENDPOINT}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">API 金鑰（提供給自動化系統，請妥善保管）</p>
            <p className="font-mono text-xs bg-gray-50 rounded-lg p-2 break-all select-all">{config.api_key}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Google Sheet 寫入網址（Apps Script 部署網址）</p>
            <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <p className="text-gray-500 mb-1">Gemini API 金鑰（病蟲害 AI 辨識用，至 aistudio.google.com 免費取得）</p>
            <input value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-500" />
            <button onClick={saveSettings} disabled={busy}
              className={`mt-2 w-full rounded-lg py-2 text-sm font-medium disabled:opacity-50 ${
                saved ? 'bg-green-100 text-green-700' : 'bg-green-600 text-white'
              }`}>
              {saved ? '已儲存' : '儲存設定'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { activeFarm, farms, members, regenerateInviteCode } = useFarm()
  const [copied, setCopied] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(activeFarm.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegen = async () => {
    if (!confirm('重新產生邀請碼後，舊的邀請碼將立即失效。確認？')) return
    setRegenLoading(true)
    try { await regenerateInviteCode() }
    catch (err) { alert(err.message) }
    finally { setRegenLoading(false) }
  }

  const isOwner = activeFarm?.myRole === 'owner'

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header title="設定" />

      <div className="p-4 flex flex-col gap-4">
        {/* User info */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-700 mb-3">帳號資訊</h2>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">電子信箱</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">農場身份</span>
              <span className={`font-medium ${isOwner ? 'text-green-600' : 'text-gray-700'}`}>
                {isOwner ? '負責人' : '成員'}
              </span>
            </div>
          </div>
        </section>

        {/* Farm info + invite */}
        {activeFarm && (
          <section className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-gray-700 mb-3">農場資訊</h2>
            <div className="flex flex-col gap-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">農場名稱</span>
                <span>{activeFarm.name}</span>
              </div>
              {activeFarm.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">地址</span>
                  <span className="text-right max-w-[60%]">{activeFarm.address}</span>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">邀請碼（分享給農場成員）</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-mono text-2xl font-bold text-center tracking-widest bg-gray-50 rounded-xl py-3 text-gray-800">
                    {activeFarm.invite_code}
                  </span>
                  <button onClick={copyCode}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {copied ? '已複製' : '複製'}
                  </button>
                </div>
                <button onClick={handleRegen} disabled={regenLoading}
                  className="mt-2 text-xs text-gray-400 w-full text-center disabled:opacity-50">
                  {regenLoading ? '重新產生中...' : '重新產生邀請碼（舊碼失效）'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Automation integration (owner only) */}
        {isOwner && activeFarm && <AutomationSection farmId={activeFarm.id} />}

        {/* Members */}
        {members.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-gray-700 mb-3">農場成員（{members.length}）</h2>
            <div className="flex flex-col divide-y divide-gray-50">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-700">{m.profile?.email || '—'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.role === 'owner' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.role === 'owner' ? '負責人' : '成員'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All farms */}
        {farms.length > 1 && (
          <section className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-gray-700 mb-3">我的農場</h2>
            {farms.map(f => (
              <div key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span>{f.name}</span>
                <span className="text-xs text-gray-400">{f.myRole === 'owner' ? '負責人' : '成員'}</span>
              </div>
            ))}
          </section>
        )}

        <button onClick={signOut}
          className="w-full border-2 border-red-200 text-red-500 rounded-2xl py-4 font-semibold active:bg-red-50">
          登出
        </button>
      </div>
    </div>
  )
}
