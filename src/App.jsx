import { useEffect } from 'react'
import AppRouter from './routes/AppRouter.jsx'
import { useAuthStore } from './store/authStore'
import { ToastHost } from './components/ui/Toast.jsx'

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])

  return (
    <>
      <AppRouter />
      <ToastHost />
    </>
  )
}
