import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthPage() {
  const { signIn, signUp, resetPasswordForEmail } = useAuth()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(email)
        if (error) throw error
        setInfo('已寄出重設密碼信，請至信箱點擊連結設定新密碼。')
      } else if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setInfo('註冊成功！請確認您的電子信箱後登入。')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || '發生錯誤，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-green-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-green-800">農作物生產履歷</h1>
          <p className="text-green-600 text-sm mt-1">農事記錄管理系統</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {mode !== 'forgot' && (
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setInfo('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {m === 'login' ? '登入' : '註冊'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="至少 6 個字元"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {info && <p className="text-green-700 text-sm bg-green-50 rounded-lg px-3 py-2">{info}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-600 text-white rounded-xl py-3.5 font-semibold text-sm mt-1 disabled:opacity-50 active:bg-green-700"
            >
              {loading ? '處理中...' : mode === 'login' ? '登入' : mode === 'register' ? '建立帳號' : '寄送重設密碼信'}
            </button>

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo('') }}
                className="text-sm text-green-600 text-center">
                忘記密碼？
              </button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => { setMode('login'); setError(''); setInfo('') }}
                className="text-sm text-gray-400 text-center">
                返回登入
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
