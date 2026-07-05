import { useState } from 'react'
import Header from '../components/layout/Header'
import { useFarm } from '../contexts/FarmContext'
import { lookupCrop, CROP_NAMES } from '../lib/cropLookup'

const STATUS_LABEL = { active: '生長中', harvested: '已採收' }
const STATUS_COLOR = { active: 'text-green-600 bg-green-50', harvested: 'text-gray-500 bg-gray-100' }

function FieldForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [area, setArea] = useState(initial?.area || '')
  const [location, setLocation] = useState(initial?.location || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit({ name, area: area || null, location, notes }) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-4">
      <div>
        <label className="label">田區名稱 *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="例：北側第一區"
          className="input" />
      </div>
      <div>
        <label className="label">面積（公頃）</label>
        <input type="number" step="0.0001" value={area} onChange={e => setArea(e.target.value)} placeholder="0.5"
          className="input" />
      </div>
      <div>
        <label className="label">地段地號 / 位置</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="例：大雅段 123-4"
          className="input" />
      </div>
      <div>
        <label className="label">備註</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="input resize-none" />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 border-2 border-gray-300 text-gray-600 rounded-xl py-3 font-semibold">取消</button>
        <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
          {loading ? '儲存中...' : initial ? '更新' : '新增田區'}
        </button>
      </div>
    </form>
  )
}

function CropForm({ fields, onSubmit, onCancel }) {
  const [fieldId, setFieldId] = useState(fields[0]?.id || '')
  const [name, setName] = useState('')
  const [variety, setVariety] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit({ field_id: fieldId, name, variety, start_date: startDate, notes }) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const classification = lookupCrop(name)

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-4">
      <div>
        <label className="label">田區 *</label>
        <select value={fieldId} onChange={e => setFieldId(e.target.value)} required className="input">
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">作物名稱 *</label>
        <input value={name} onChange={e => setName(e.target.value)} required list="crop-names"
          placeholder="例：水稻、番茄" className="input" />
        <datalist id="crop-names">
          {CROP_NAMES.map(n => <option key={n} value={n} />)}
        </datalist>
        {classification && (
          <div className="mt-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
            分類：{classification.paths.map(p => p.text).join('；')}
          </div>
        )}
      </div>
      <div>
        <label className="label">品種</label>
        <input value={variety} onChange={e => setVariety(e.target.value)} placeholder="例：台梗 9 號" className="input" />
      </div>
      <div>
        <label className="label">種植日期 *</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input" />
      </div>
      <div>
        <label className="label">備註</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input resize-none" />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 border-2 border-gray-300 text-gray-600 rounded-xl py-3 font-semibold">取消</button>
        <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
          {loading ? '儲存中...' : '新增作物'}
        </button>
      </div>
    </form>
  )
}

export default function FieldsPage() {
  const { fields, crops, createField, updateField, deleteField, createCrop, updateCrop } = useFarm()
  const [modal, setModal] = useState(null) // null | {type: 'field'|'crop'|'editField', data?}

  const handleHarvestCrop = async (crop) => {
    if (!confirm(`確認將「${crop.name}」標記為已採收？`)) return
    await updateCrop(crop.id, { status: 'harvested', end_date: new Date().toISOString().split('T')[0] })
  }

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header
        title="田區管理"
        action={
          <div className="flex gap-2">
            <button onClick={() => setModal({ type: 'field' })}
              className="bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm font-medium">
              + 田區
            </button>
            <button onClick={() => setModal({ type: 'crop' })}
              className="bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm font-medium">
              + 作物
            </button>
          </div>
        }
      />

      <div className="p-4 flex flex-col gap-4 pb-24">
        {fields.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">🌾</div>
            <p>尚無田區</p>
            <p className="text-xs mt-1">點擊右上角「+ 田區」新增</p>
          </div>
        ) : fields.map(field => {
          const fieldCrops = crops.filter(c => c.field_id === field.id)
          const activeCrops = fieldCrops.filter(c => c.status === 'active')
          return (
            <div key={field.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{field.name}</h3>
                  <div className="text-xs text-gray-500 mt-0.5 flex gap-2 flex-wrap">
                    {field.area && <span>{field.area} 公頃</span>}
                    {field.location && <span>{field.location}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ type: 'editField', data: field })}
                    className="text-xs text-gray-400 px-2 py-1">編輯</button>
                  {activeCrops.length === 0 && (
                    <button onClick={() => deleteField(field.id)}
                      className="text-xs text-red-400 px-2 py-1">刪除</button>
                  )}
                </div>
              </div>

              {fieldCrops.length > 0 && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {fieldCrops.map(crop => {
                    const cls = lookupCrop(crop.name)
                    return (
                    <div key={crop.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm text-gray-700">{crop.name}</span>
                        {crop.variety && <span className="text-xs text-gray-400 ml-1">（{crop.variety}）</span>}
                        {cls && <span className="text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5 ml-1">{cls.paths[0].cat1}</span>}
                        <div className="text-xs text-gray-400 mt-0.5">{crop.start_date} 種植</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[crop.status]}`}>
                          {STATUS_LABEL[crop.status]}
                        </span>
                        {crop.status === 'active' && (
                          <button onClick={() => handleHarvestCrop(crop)}
                            className="text-xs text-purple-500 px-2 py-1 border border-purple-200 rounded-lg">
                            採收
                          </button>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end" onClick={() => setModal(null)}>
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto pb-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            <h3 className="text-center font-bold text-gray-800 mb-2 px-4">
              {modal.type === 'field' ? '新增田區' : modal.type === 'editField' ? '編輯田區' : '新增作物'}
            </h3>
            {modal.type === 'crop' ? (
              <CropForm fields={fields} onSubmit={async (d) => { await createCrop(d); setModal(null) }} onCancel={() => setModal(null)} />
            ) : (
              <FieldForm
                initial={modal.data}
                onSubmit={async (d) => {
                  if (modal.type === 'editField') await updateField(modal.data.id, d)
                  else await createField(d)
                  setModal(null)
                }}
                onCancel={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
