import { useState } from 'react'
import { useFarm } from '../../contexts/FarmContext'
import { supabase } from '../../lib/supabase'
import { ACTIVITY_TYPES } from '../../lib/constants'

const WEATHERS = ['晴', '多雲', '陰', '雨', '不記錄']
const UNITS = ['公升', '毫升', '公斤', '公克', '台斤', '瓶', '包', '袋', '次']

const today = () => new Date().toISOString().split('T')[0]

// 壓縮照片（最長邊 1280px、JPEG 85%），減少上傳量與 AI 辨識成本
async function compressToBase64(file) {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
}

async function callPestApi(body) {
  const { data, error } = await supabase.functions.invoke('pest-diagnosis', { body })
  if (error) throw new Error(error.message || 'AI 服務呼叫失敗')
  if (data?.error) throw new Error(data.error)
  return data
}

function MaterialRow({ item, index, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 flex gap-2">
        <input
          value={item.name} onChange={e => onChange(index, 'name', e.target.value)}
          placeholder="資材名稱"
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <input
          type="number" value={item.quantity} onChange={e => onChange(index, 'quantity', e.target.value)}
          placeholder="用量"
          className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <select
          value={item.unit} onChange={e => onChange(index, 'unit', e.target.value)}
          className="w-20 border border-gray-300 rounded-lg px-1 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <button type="button" onClick={() => onRemove(index)} className="text-red-400 text-lg leading-none pt-2">×</button>
    </div>
  )
}

export default function ActivityForm({ initial = null, onSubmit, onCancel }) {
  const { activeFarm, fields, crops } = useFarm()
  const [data, setData] = useState({
    record_date: initial?.record_date || today(),
    field_id: initial?.field_id || fields[0]?.id || '',
    crop_id: initial?.crop_id || '',
    activity_type: initial?.activity_type || '整地',
    weather: initial?.weather || '晴',
    description: initial?.description || '',
    notes: initial?.notes || '',
    materials: initial?.materials || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // photo: { base64, preview, url, drive_link }（url 有值代表已上傳）
  const [photo, setPhoto] = useState(null)
  const [diagnosing, setDiagnosing] = useState(false)

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const fieldCrops = crops.filter(c => c.field_id === data.field_id && c.status === 'active')

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const base64 = await compressToBase64(file)
      setPhoto({ base64, preview: `data:image/jpeg;base64,${base64}` })
    } catch {
      setError('照片讀取失敗，請改用其他照片')
    }
  }

  const diagnose = async () => {
    setDiagnosing(true); setError('')
    try {
      const crop = fieldCrops.find(c => c.id === data.crop_id)
      const res = await callPestApi({
        action: 'diagnose',
        farm_id: activeFarm.id,
        image_base64: photo.base64,
        crop_name: crop?.name || '',
      })
      setPhoto(p => ({ ...p, url: res.photo_url, drive_link: res.drive_link }))
      set('description', res.diagnosis)
    } catch (err) {
      setError(err.message)
    } finally {
      setDiagnosing(false)
    }
  }

  const addMaterial = () => set('materials', [...data.materials, { name: '', quantity: '', unit: '公升' }])
  const updateMaterial = (i, k, v) => {
    const m = [...data.materials]
    m[i] = { ...m[i], [k]: v }
    set('materials', m)
  }
  const removeMaterial = (i) => set('materials', data.materials.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      let photos = initial?.photos || []
      if (photo) {
        let { url, drive_link } = photo
        if (!url) {
          const res = await callPestApi({ action: 'upload', farm_id: activeFarm.id, image_base64: photo.base64 })
          url = res.photo_url
          drive_link = res.drive_link
        }
        photos = [{ url, drive_link }]
      }
      const payload = {
        ...data,
        crop_id: data.crop_id || null,
        materials: data.materials.filter(m => m.name.trim()),
        photos,
      }
      await onSubmit(payload)
      // 病蟲害記錄補寫一列到試算表「作物觀察與病蟲害紀錄」（失敗不影響已儲存的記錄）
      if (photo && data.activity_type === '病蟲害') {
        callPestApi({
          action: 'log',
          farm_id: activeFarm.id,
          record_date: data.record_date,
          batch_id: fields.find(f => f.id === data.field_id)?.name || '',
          description: data.description,
          drive_link: photos[0]?.drive_link || photos[0]?.url || '',
        }).catch(() => {})
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 pb-24">
      {/* Date */}
      <div>
        <label className="label">作業日期</label>
        <input type="date" value={data.record_date} onChange={e => set('record_date', e.target.value)}
          required className="input" />
      </div>

      {/* Field */}
      <div>
        <label className="label">田區 *</label>
        <select value={data.field_id} onChange={e => { set('field_id', e.target.value); set('crop_id', '') }}
          required className="input">
          <option value="">請選擇田區</option>
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Crop */}
      <div>
        <label className="label">作物（選填）</label>
        <select value={data.crop_id} onChange={e => set('crop_id', e.target.value)} className="input">
          <option value="">— 不指定 —</option>
          {fieldCrops.map(c => <option key={c.id} value={c.id}>{c.name}{c.variety ? `（${c.variety}）` : ''}</option>)}
        </select>
      </div>

      {/* Activity Type */}
      <div>
        <label className="label">農事類型 *</label>
        <div className="grid grid-cols-5 gap-2">
          {ACTIVITY_TYPES.map(t => (
            <button key={t} type="button"
              onClick={() => set('activity_type', t)}
              className={`py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                data.activity_type === t
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Pest photo + AI diagnosis */}
      {data.activity_type === '病蟲害' && (
        <div>
          <label className="label">病蟲害照片</label>
          {photo ? (
            <div className="flex flex-col gap-2">
              <img src={photo.preview} alt="病蟲害照片" className="rounded-xl max-h-60 object-contain bg-gray-50" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setPhoto(null)}
                  className="flex-1 border-2 border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium">
                  移除照片
                </button>
                <button type="button" onClick={diagnose} disabled={diagnosing}
                  className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                  {diagnosing ? 'AI 辨識中...' : '🔍 AI 病蟲害辨識'}
                </button>
              </div>
              <p className="text-xs text-gray-400">辨識結果會自動填入「作業說明」，可再修改；照片將備份至 Google 雲端硬碟並寫入產銷履歷試算表</p>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1 border-2 border-dashed border-gray-300 rounded-xl py-6 text-gray-400 text-sm cursor-pointer">
              📷 拍照或選擇照片
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>
      )}

      {/* Weather */}
      <div>
        <label className="label">天氣</label>
        <div className="flex gap-2 flex-wrap">
          {WEATHERS.map(w => (
            <button key={w} type="button"
              onClick={() => set('weather', w)}
              className={`px-4 py-2 rounded-full text-sm border-2 transition-colors ${
                data.weather === w
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">使用資材</label>
          <button type="button" onClick={addMaterial}
            className="text-green-600 text-sm font-medium">+ 新增資材</button>
        </div>
        {data.materials.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-3 bg-gray-50 rounded-xl">無使用資材</p>
        )}
        <div className="flex flex-col gap-2">
          {data.materials.map((m, i) => (
            <MaterialRow key={i} item={m} index={i} onChange={updateMaterial} onRemove={removeMaterial} />
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">作業說明</label>
        <textarea value={data.description} onChange={e => set('description', e.target.value)}
          placeholder="描述本次農事作業的內容..."
          rows={3}
          className="input resize-none" />
      </div>

      {/* Notes */}
      <div>
        <label className="label">備註</label>
        <textarea value={data.notes} onChange={e => set('notes', e.target.value)}
          placeholder="補充說明、觀察記錄..."
          rows={2}
          className="input resize-none" />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 border-2 border-gray-300 text-gray-600 rounded-xl py-3.5 font-semibold">
            取消
          </button>
        )}
        <button type="submit" disabled={loading}
          className="flex-1 bg-green-600 text-white rounded-xl py-3.5 font-semibold disabled:opacity-50">
          {loading ? '儲存中...' : initial ? '更新記錄' : '儲存記錄'}
        </button>
      </div>
    </form>
  )
}
