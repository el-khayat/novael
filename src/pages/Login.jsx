import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthShell from '../components/auth/AuthShell.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthStore } from '../store/authStore'
import { toast } from '../components/ui/Toast.jsx'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const from = location.state?.from?.pathname || '/account'

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back', 'Signed in successfully.')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error('Sign in failed', err.message || 'Check your credentials.')
    }
  }

  return (
    <>
      <Helmet><title>Sign In — Novaël</title></Helmet>
      <AuthShell
        title="Welcome Back"
        subtitle="Your Beauty Awaits"
        footer={<>No account? <Link to="/register" className="text-gold link-luxe">Create one</Link></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[11px] uppercase tracking-[0.2em] text-black/60 hover:text-gold">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="dark" className="w-full" loading={isSubmitting}>
            Sign In
          </Button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <span className="relative bg-ivory px-4 text-[10px] uppercase tracking-[0.25em] text-black/40">Or</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try { await loginWithGoogle() } catch (e) { toast.error('Google sign-in failed', e.message) }
            }}
            className="w-full h-12 border border-black/20 hover:border-black text-[11px] uppercase tracking-[0.25em] transition-colors flex items-center justify-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>
        </form>
      </AuthShell>
    </>
  )
}
