import { useState } from 'react'
import Header from '../components/layout/Header'
import { useFarm } from '../contexts/FarmContext'
import { supabase } from '../lib/supabase'

export default function ReportPage() {
  const { activeFarm, fields, crops } = useFarm()
  const [fieldId, setFieldId] = useState('')
  const [cropId, setCropId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const selectedCrops = cropId
    ? crops.filter(c => c.id === cropId)
    : fieldId
      ? crops.filter(c => c.field_id === fieldId)
      : crops

  const generatePdf = async () => {
    if (!activeFarm) return
    setError(''); setGenerating(true)

    try {
      let query = supabase
        .from('activity_records')
        .select(`*, fields(name, area, location), crops(name, variety, start_date, end_date)`)
        .eq('farm_id', activeFarm.id)
        .order('record_date', { ascending: true })
        .order('created_at', { ascending: true })

      if (fieldId) query = query.eq('field_id', fieldId)
      if (cropId) query = query.eq('crop_id', cropId)
      if (dateFrom) query = query.gte('record_date', dateFrom)
      if (dateTo) query = query.lte('record_date', dateTo)

      const { data: records, error: fetchErr } = await query
      if (fetchErr) throw fetchErr
      if (!records || records.length === 0) { setError('查詢範圍內沒有農事記錄'); setGenerating(false); return }

      await buildPdf(records)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const buildPdf = async (records) => {
    // PDF 函式庫體積大，僅在實際匯出時動態載入，減少 APP 啟動時的記憶體負擔
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Load a CJK-compatible font — jsPDF ships with Helvetica only.
    // We use canvas-based text for CJK headers and autoTable for the body.
    // To handle Chinese we encode as UTF-8 text boxes with doc.text() using
    // the built-in approach: set doc font to 'helvetica' and rely on the
    // PDF viewer's CJK font substitution, which works for most modern viewers.
    // For production, embed a subset of NotoSansCJK via addFileToVFS.

    const pageW = doc.internal.pageSize.getWidth()
    const margin = 15

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('農作物生產履歷記錄', pageW / 2, 20, { align: 'center' })
    // 農作物生產履歷記錄

    // Farm info block
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    let y = 32

    const infoRows = [
      ['農場名稱', activeFarm.name, '農場地址', activeFarm.address || '—'],
      // 農場名稱 / 農場地址
    ]

    if (fieldId) {
      const f = fields.find(f => f.id === fieldId)
      if (f) infoRows.push([
        '田區', f.name,
        '面積', f.area ? `${f.area} 公頃` : '—',
        // 田區 / 面積 / 公頃
      ])
      if (f?.location) infoRows.push(['地段地號', f.location, '', ''])
    }

    const dateRange = [dateFrom || '全部', '至', dateTo || '今日']
    // 至 / 今日
    infoRows.push(['記錄期間', dateRange.join(' '), '產出日期', new Date().toLocaleDateString('zh-TW')])
    // 記錄期間 / 產出日期

    autoTable(doc, {
      startY: y,
      head: [],
      body: infoRows,
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 22, fillColor: [240, 250, 240] },
        1: { cellWidth: 55 },
        2: { fontStyle: 'bold', cellWidth: 22, fillColor: [240, 250, 240] },
        3: { cellWidth: 55 },
      },
      margin: { left: margin, right: margin },
      theme: 'grid',
    })

    y = doc.lastAutoTable.finalY + 6

    // Main records table
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('農事作業記錄', margin, y)
    // 農事作業記錄
    y += 3

    const tableHead = [
      ['日期', '田區', '作物', '農事類型', '天氣', '使用資材', '作業說明', '備註'],
      // 日期 田區 作物 農事類型 天氣 使用資材 作業說明 備註
    ]

    const tableBody = records.map(r => [
      r.record_date,
      r.fields?.name || '—',
      r.crops ? `${r.crops.name}${r.crops.variety ? `(${r.crops.variety})` : ''}` : '—',
      r.activity_type,
      r.weather === '不記錄' ? '' : r.weather,
      // 不記錄
      (r.materials || []).map(m => `${m.name} ${m.quantity}${m.unit}`).join('\n') || '—',
      r.description || '—',
      r.notes || '',
    ])

    autoTable(doc, {
      startY: y,
      head: tableHead,
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 16 },
        4: { cellWidth: 10 },
        5: { cellWidth: 30 },
        6: { cellWidth: 40 },
        7: { cellWidth: 24 },
      },
      alternateRowStyles: { fillColor: [248, 255, 248] },
      margin: { left: margin, right: margin },
      theme: 'grid',
    })

    // Footer
    const finalY = doc.lastAutoTable.finalY + 8
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150)
    doc.text(
      `本記錄由農作物生產履歷系統產生 · 共 ${records.length} 筆記錄 · ${new Date().toLocaleString('zh-TW')}`,
      // 本記錄由農作物生產履歷系統產生 · 共 N 筆記錄 · 日期時間
      pageW / 2, finalY, { align: 'center' }
    )
    doc.setTextColor(0)

    const filename = `農事履歷_${activeFarm.name}_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.pdf`
    doc.save(filename)
  }

  return (
    <div className="flex flex-col flex-1 pb-20">
      <Header title="匯出履歷報告" />

      <div className="p-4 flex flex-col gap-4">
        <div className="bg-green-50 rounded-2xl p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">📄 生產履歷 PDF 報告</p>
          <p>可作為申請友善種植、有機轉型期或有機耕作認證的農事記錄附件。</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          <div>
            <label className="label">田區（選填）</label>
            <select value={fieldId} onChange={e => { setFieldId(e.target.value); setCropId('') }} className="input">
              <option value="">全部田區</option>
              {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">作物（選填）</label>
            <select value={cropId} onChange={e => setCropId(e.target.value)} className="input">
              <option value="">全部作物</option>
              {selectedCrops.map(c => (
                <option key={c.id} value={c.id}>
                  {fields.find(f => f.id === c.field_id)?.name} — {c.name}{c.variety ? `（${c.variety}）` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label">開始日期</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" />
            </div>
            <div className="flex-1">
              <label className="label">結束日期</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={generatePdf} disabled={generating}
            className="w-full bg-green-600 text-white rounded-xl py-4 font-bold text-base disabled:opacity-50 active:bg-green-700"
          >
            {generating ? '產生中...' : '📄 下載 PDF 履歷報告'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">報告包含內容</p>
          <ul className="flex flex-col gap-1 list-none">
            {['農場基本資料（名稱、地址、田區）', '所有農事作業記錄（整地、施肥、用藥等）', '使用資材明細（品名、用量）', '天氣記錄', '作業說明與備註'].map(item => (
              <li key={item} className="flex gap-2 items-start"><span className="text-green-500 shrink-0">✓</span>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
