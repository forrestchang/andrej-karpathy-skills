import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import RecordCard from '../components/records/RecordCard'
import ActivityForm from '../components/records/ActivityForm'
import { useRecords } from '../hooks/useRecords'
import { useFarm } from '../contexts/FarmContext'
import { ACTIVITY_TYPES } from '../lib/constants'

function RecordDetail({ record, onEdit, onDelete }) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-bold text-lg">{record.activity_type}</span>
            <p className="text-sm text-gray-500">{record.record_date} · {record.weather !== '不記錄' ? record.weather : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="text-sm text-green-600 px-3 py-1.5 border border-green-600 rounded-lg">編輯</button>
            <button onClick={onDelete} className="text-sm text-red-500 px-3 py-1.5 border border-red-300 rounded-lg">刪除</button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
          <row className="flex gap-2 text-sm"><span className="text-gray-400 w-16">田區</span><span>{record.fields?.name}</span></row>
          {record.crops?.name && (
            <row className="flex gap-2 text-sm"><span className="text-gray-400 w-16">作物</span><span>{record.crops.name}{record.crops.variety ? `（${record.crops.variety}）` : ''}</span></row>
          )}
          {record.description && (
            <row className="flex gap-2 text-sm"><span className="text-gray-400 w-16">說明</span><span className="flex-1">{record.description}</span></row>
          )}
          {record.notes && (
            <row className="flex gap-2 text-sm"><span className="text-gray-400 w-16">備註</span><span className="flex-1">{record.notes}</span></row>
          )}
          <row className="flex gap-2 text-sm"><span className="text-gray-400 w-16">記錄人</span><span>{record.source === 'automation' ? '🤖 自動化' : record.recorder?.email}</span></row>
        </div>

        {record.photos?.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">照片</p>
            <div className="flex flex-col gap-2">
              {record.photos.map((p, i) => (
                <a key={i} href={p.drive_link || p.url} target="_blank" rel="noreferrer">
                  <img src={p.url} alt="記錄照片" className="rounded-xl w-full object-contain bg-gray-50" />
                </a>
              ))}
            </div>
          </div>
        )}

        {record.materials?.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">使用資材</p>
            <div className="flex flex-col gap-1">
              {record.materials.map((m, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-gray-500">{m.quantity} {m.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function NewRecordPage() {
  const navigate = useNavigate()
  const { createRecord } = useRecords()
  const { fields } = useFarm()

  if (fields.length === 0) {
    return (
      <div className="flex flex-col flex-1 pb-20">
        <Header title="新增農事記錄" />
        <div className="p-8 text-center text-gray-400">
          <div className="text-4xl mb-3">🌾</div>
          <p>請先新增田區再記錄農事</p>
          <button onClick={() => navigate('/fields')} className="mt-4 text-green-600 font-medium">前往田區管理 →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header title="新增農事記錄" />
      <ActivityForm
        onSubmit={async (d) => { await createRecord(d); navigate('/records') }}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}

export function RecordDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { records, loading, fetchRecords, updateRecord, deleteRecord } = useRecords()
  const { activeFarm } = useFarm()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (activeFarm) fetchRecords({ id })
  }, [activeFarm, id])

  const record = records.find(r => r.id === id)

  const handleDelete = async () => {
    if (!confirm('確定要刪除此農事記錄？')) return
    await deleteRecord(id)
    navigate('/records')
  }

  if (loading) return <div className="flex flex-col flex-1 pb-20"><Header title="農事記錄" /><div className="p-8 text-center text-gray-400">載入中...</div></div>
  if (!record) return <div className="flex flex-col flex-1 pb-20"><Header title="農事記錄" /><div className="p-8 text-center text-gray-400">找不到記錄</div></div>

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header title={editing ? '編輯記錄' : '農事記錄詳情'} />
      {editing ? (
        <ActivityForm
          initial={record}
          onSubmit={async (d) => { await updateRecord(id, d); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <RecordDetail
          record={record}
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default function RecordsPage() {
  const navigate = useNavigate()
  const { activeFarm, fields } = useFarm()
  const { records, loading, fetchRecords } = useRecords()
  const [filters, setFilters] = useState({ field_id: '', activity_type: '', date_from: '', date_to: '' })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (activeFarm) fetchRecords(filters)
  }, [activeFarm, filters])

  const setFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header
        title="農事記錄"
        action={
          <button onClick={() => navigate('/records/new')}
            className="bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm font-medium">
            + 新增
          </button>
        }
      />

      <div className="p-4 flex flex-col gap-3">
        {/* Filter toggle */}
        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-xl px-4 py-2.5 shadow-sm">
          🔍 篩選條件 {showFilters ? '▲' : '▼'}
          {Object.values(filters).some(Boolean) && <span className="ml-auto bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
        </button>

        {showFilters && (
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <div>
              <label className="label">田區</label>
              <select value={filters.field_id} onChange={e => setFilter('field_id', e.target.value)} className="input">
                <option value="">全部田區</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">農事類型</label>
              <select value={filters.activity_type} onChange={e => setFilter('activity_type', e.target.value)} className="input">
                <option value="">全部類型</option>
                {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="label">開始日期</label>
                <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)} className="input" />
              </div>
              <div className="flex-1">
                <label className="label">結束日期</label>
                <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)} className="input" />
              </div>
            </div>
            <button onClick={() => setFilters({ field_id: '', activity_type: '', date_from: '', date_to: '' })}
              className="text-sm text-gray-400 text-center">清除篩選</button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-8">載入中...</div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>沒有符合條件的農事記錄</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map(r => (
              <RecordCard key={r.id} record={r} onClick={() => navigate(`/records/${r.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
