import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const action = mode === 'login' ? signIn : signUp
    const { error } = await action(email, password)

    setSubmitting(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="container" style={{ padding: '80px 32px', maxWidth: 420 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        {mode === 'login' ? 'Welcome back' : 'Create an account'}
      </h1>
      <p style={{ color: 'var(--color-ink-soft)', marginBottom: 32 }}>
        {mode === 'login' ? 'Log in to your account.' : 'Sign up to save items and check out.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}

        <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={{ marginTop: 20, fontSize: 14, textDecoration: 'underline', color: 'var(--color-ink-soft)' }}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div>
  )
}

const styles = {
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px', fontSize: 15,
    border: '1px solid var(--color-line)', borderRadius: 2,
    background: 'var(--color-white)', fontFamily: 'var(--font-body)',
  },
}
