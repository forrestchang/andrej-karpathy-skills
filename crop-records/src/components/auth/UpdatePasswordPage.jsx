import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function UpdatePasswordPage() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await updatePassword(password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-green-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-green-800">設定新密碼</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="至少 6 個字元"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-sm mt-1 disabled:opacity-50 active:bg-green-700"
            >
              {loading ? '更新中...' : '更新密碼'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
