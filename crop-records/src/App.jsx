import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FarmProvider, useFarm } from './contexts/FarmContext'
import AuthPage from './components/auth/AuthPage'
import UpdatePasswordPage from './components/auth/UpdatePasswordPage'
import NoFarmPage from './components/auth/NoFarmPage'
import BottomNav from './components/layout/BottomNav'
import OfflineBanner from './components/layout/OfflineBanner'
import HomePage from './pages/HomePage'
import FieldsPage from './pages/FieldsPage'
import RecordsPage, { NewRecordPage, RecordDetailPage } from './pages/RecordsPage'
import ReportPage from './pages/ReportPage'
import SettingsPage from './pages/SettingsPage'

function AppRoutes() {
  const { user, loading: authLoading, passwordRecovery } = useAuth()
  const { farms, loading: farmLoading } = useFarm()

  if (authLoading || farmLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-green-600 text-lg">載入中...</div>
      </div>
    )
  }

  if (passwordRecovery) return <UpdatePasswordPage />
  if (!user) return <AuthPage />
  if (farms.length === 0) return <NoFarmPage />

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fields" element={<FieldsPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/new" element={<NewRecordPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <FarmProvider>
          <AppRoutes />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
