import { useFarm } from '../../contexts/FarmContext'

export default function Header({ title, action }) {
  const { activeFarm, farms, setActiveFarm } = useFarm()

  return (
    <header className="bg-green-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-base font-bold leading-tight">{title}</h1>
        {farms.length > 1 ? (
          <select
            value={activeFarm?.id || ''}
            onChange={e => setActiveFarm(farms.find(f => f.id === e.target.value))}
            className="text-xs text-green-100 bg-transparent border-none outline-none mt-0.5 cursor-pointer"
          >
            {farms.map(f => <option key={f.id} value={f.id} className="text-black">{f.name}</option>)}
          </select>
        ) : (
          <p className="text-xs text-green-200 mt-0.5">{activeFarm?.name || '未選擇農場'}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
