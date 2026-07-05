import { useState } from 'react'
import { useFarm } from '../../contexts/FarmContext'
import { useAuth } from '../../contexts/AuthContext'

export default function NoFarmPage() {
  const { createFarm, joinFarm } = useFarm()
  const { signOut } = useAuth()
  const [mode, setMode] = useState(null) // null | 'create' | 'join'
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'create') await createFarm(name, address)
      else await joinFarm(inviteCode)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-green-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚜</div>
          <h2 className="text-xl font-bold text-green-800">設定您的農場</h2>
          <p className="text-green-600 text-sm mt-1">建立新農場或加入現有農場</p>
        </div>

        {!mode ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-green-600 text-white rounded-2xl py-5 font-semibold text-base active:bg-green-700"
            >
              🌱 建立新農場
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white border-2 border-green-600 text-green-700 rounded-2xl py-5 font-semibold text-base active:bg-green-50"
            >
              🔗 使用邀請碼加入
            </button>
            <button onClick={signOut} className="text-gray-400 text-sm mt-2">登出</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <button onClick={() => { setMode(null); setError('') }} className="text-green-600 text-sm mb-4">← 返回</button>
            <form onSubmit={submit} className="flex flex-col gap-4">
              {mode === 'create' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">農場名稱 *</label>
                    <input
                      value={name} onChange={e => setName(e.target.value)} required
                      placeholder="例：永續有機農場"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">農場地址</label>
                    <input
                      value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="例：台中市大雅區..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">農場邀請碼</label>
                  <input
                    value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} required
                    placeholder="8 碼邀請碼"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={8}
                  />
                </div>
              )}
              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-sm disabled:opacity-50"
              >
                {loading ? '處理中...' : mode === 'create' ? '建立農場' : '加入農場'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
