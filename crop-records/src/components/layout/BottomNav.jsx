import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首頁', icon: '🏠' },
  { to: '/fields', label: '田區', icon: '🌾' },
  { to: '/records', label: '記錄', icon: '📋' },
  { to: '/report', label: '報告', icon: '📄' },
  { to: '/settings', label: '設定', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 safe-area-bottom">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
              isActive ? 'text-green-600 font-semibold' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
