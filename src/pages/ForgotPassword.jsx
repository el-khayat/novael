import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AuthShell from '../components/auth/AuthShell.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthStore } from '../store/authStore'
import { toast } from '../components/ui/Toast.jsx'

export default function ForgotPassword() {
  const send = useAuthStore((s) => s.sendPasswordReset)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await send(email)
      setSent(true)
    } catch (err) {
      toast.error('Could not send email', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Forgot Password — Novaël</title></Helmet>
      <AuthShell
        title="Reset Password"
        subtitle="We've Got You"
        footer={<Link to="/login" className="text-gold link-luxe">Back to Sign In</Link>}
      >
        {sent ? (
          <div className="text-center py-8">
            <p className="text-black/70 leading-relaxed">
              Check your inbox — a reset link is on its way to <span className="text-gold font-medium">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <p className="text-sm text-black/60 mb-2">Enter your email and we'll send you a reset link.</p>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="dark" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  )
}
