import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, PenLine } from 'lucide-react'
import axios from 'axios'

function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('http://127.0.0.1:8000/signup', { username, email, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoRow}>
          <PenLine size={22} color="#e8e8e8" />
          <span style={styles.logoText}>PostIt</span>
        </div>

        <h1 style={styles.heading}>Create an account</h1>
        <p style={styles.sub}>Start noting down what you learn, every day.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} style={styles.form}>

          <div style={styles.inputWrapper}>
            <User size={16} color="#9b9b9b" style={styles.inputIcon} />
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <Mail size={16} color="#9b9b9b" style={styles.inputIcon} />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <Lock size={16} color="#9b9b9b" style={styles.inputIcon} />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button style={loading ? {...styles.button, opacity: 0.6} : styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Continue'}
          </button>

        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Log in</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191919',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px 40px',
    backgroundColor: '#1f1f1f',
    borderRadius: '8px',
    border: '1px solid #2e2e2e',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e8e8e8',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e8e8e8',
    marginBottom: '8px',
  },
  sub: {
    fontSize: '14px',
    color: '#9b9b9b',
    marginBottom: '28px',
  },
  error: {
    backgroundColor: '#2e1a1a',
    border: '1px solid #5c2e2e',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#e8e8e8',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    marginTop: '8px',
    padding: '10px',
    backgroundColor: '#e8e8e8',
    color: '#191919',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  switchText: {
    marginTop: '24px',
    fontSize: '13px',
    color: '#9b9b9b',
    textAlign: 'center',
  },
  link: {
    color: '#e8e8e8',
    textDecoration: 'underline',
  },
}

export default Signup