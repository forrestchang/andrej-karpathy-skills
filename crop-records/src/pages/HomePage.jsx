import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import RecordCard from '../components/records/RecordCard'
import { useRecords } from '../hooks/useRecords'
import { useFarm } from '../contexts/FarmContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { activeFarm } = useFarm()
  const { records, loading, fetchRecords } = useRecords()

  useEffect(() => {
    if (activeFarm) fetchRecords({ limit: 10 })
  }, [activeFarm, fetchRecords])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter(r => r.record_date === todayStr)

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header title="農作物生產履歷" />

      <div className="p-4 flex flex-col gap-4">
        {/* Quick add button */}
        <button
          onClick={() => navigate('/records/new')}
          className="w-full bg-green-600 text-white rounded-2xl py-5 text-base font-bold shadow-sm active:bg-green-700 flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span> 新增農事記錄
        </button>

        {/* Today's records */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            今日記錄（{todayRecords.length}）
          </h2>
          {todayRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">
              今天還沒有農事記錄
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayRecords.map(r => (
                <RecordCard key={r.id} record={r} onClick={() => navigate(`/records/${r.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Recent records */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">最近記錄</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-8">載入中...</div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
              <div className="text-4xl mb-3">📋</div>
              <p>尚無農事記錄</p>
              <p className="text-xs mt-1">點擊上方按鈕開始記錄第一筆農事</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {records.filter(r => r.record_date !== todayStr).slice(0, 5).map(r => (
                <RecordCard key={r.id} record={r} onClick={() => navigate(`/records/${r.id}`)} />
              ))}
              {records.length >= 10 && (
                <button onClick={() => navigate('/records')} className="text-green-600 text-sm text-center py-2">
                  查看全部記錄 →
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
