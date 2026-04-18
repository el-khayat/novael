import { Link, useNavigate } from 'react-router-dom'
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
  fullName: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
  agree: z.boolean().refine((v) => v === true, { message: 'You must agree' }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
})

export default function Register() {
  const navigate = useNavigate()
  const registerFn = useAuthStore((s) => s.register)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  })

  const onSubmit = async (data) => {
    try {
      await registerFn(data.email, data.password, data.fullName)
      toast.success('Welcome to Novaël', 'Your 15% welcome code has been added.')
      navigate('/account')
    } catch (err) {
      toast.error('Could not create account', err.message || 'Try again.')
    }
  }

  return (
    <>
      <Helmet><title>Create Account — Novaël</title></Helmet>
      <AuthShell
        title="Create Account"
        subtitle="Join The Novaël Circle"
        footer={<>Already have an account? <Link to="/login" className="text-gold link-luxe">Sign in</Link></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

          <label className="flex items-start gap-3 text-[11px] text-black/60 cursor-pointer">
            <input type="checkbox" {...register('agree')} className="accent-gold mt-0.5" />
            <span>
              I agree to the <Link to="/" className="text-gold link-luxe">Terms</Link> & <Link to="/" className="text-gold link-luxe">Privacy Policy</Link>.
            </span>
          </label>
          {errors.agree && <p className="text-xs text-rose-nude">{errors.agree.message}</p>}

          <div className="p-4 border border-gold/30 bg-gold/5 text-[11px] uppercase tracking-[0.2em] text-black/70">
            <span className="text-gold font-semibold">Welcome Gift:</span> 15% off your first order
          </div>

          <Button type="submit" variant="dark" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>
        </form>
      </AuthShell>
    </>
  )
}
