const TYPE_COLORS = {
  '整地': 'bg-amber-100 text-amber-800',
  '播種': 'bg-blue-100 text-blue-800',
  '定植': 'bg-cyan-100 text-cyan-800',
  '施肥': 'bg-green-100 text-green-800',
  '追肥': 'bg-emerald-100 text-emerald-800',
  '用藥': 'bg-red-100 text-red-800',
  '病蟲害': 'bg-orange-100 text-orange-800',
  '灌溉': 'bg-sky-100 text-sky-800',
  '採收': 'bg-purple-100 text-purple-800',
  '其他': 'bg-gray-100 text-gray-700',
}

const WEATHER_ICONS = { '晴': '☀️', '多雲': '⛅', '陰': '☁️', '雨': '🌧️', '不記錄': '' }

export default function RecordCard({ record, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-sm p-4 active:bg-gray-50 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[record.activity_type] || TYPE_COLORS['其他']}`}>
              {record.activity_type}
            </span>
            {record.weather && record.weather !== '不記錄' && (
              <span className="text-sm">{WEATHER_ICONS[record.weather]}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="font-medium text-gray-800">{record.fields?.name}</span>
            {record.crops?.name && (
              <>
                <span className="text-gray-300">·</span>
                <span>{record.crops.name}{record.crops.variety ? `（${record.crops.variety}）` : ''}</span>
              </>
            )}
          </div>
          {record.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{record.description}</p>
          )}
          {record.materials?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {record.materials.map((m, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {m.name} {m.quantity}{m.unit}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium text-gray-700">{record.record_date}</p>
          <p className="text-xs text-gray-400 mt-0.5">{record.source === 'automation' ? '🤖 自動化' : record.recorder?.email?.split('@')[0]}</p>
        </div>
      </div>
    </div>
  )
}
