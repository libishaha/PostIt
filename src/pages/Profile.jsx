import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Calendar, FileText } from 'lucide-react'
import axios from 'axios'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <span style={styles.loadingText}>Loading...</span>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={18} color="#e8e8e8" />
        </button>
        <span style={styles.navTitle}>Profile</span>
      </nav>

      <div style={styles.main}>

        {/* Avatar block */}
        <div style={styles.avatarBlock}>
          <div style={styles.avatar}>
            <User size={36} color="#9b9b9b" />
          </div>
          <h1 style={styles.username}>{profile.username}</h1>
          <p style={styles.email}>{profile.email}</p>
        </div>

        {/* Info cards */}
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Mail size={16} color="#9b9b9b" />
            </div>
            <div>
              <p style={styles.infoLabel}>Email</p>
              <p style={styles.infoValue}>{profile.email}</p>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Calendar size={16} color="#9b9b9b" />
            </div>
            <div>
              <p style={styles.infoLabel}>Member since</p>
              <p style={styles.infoValue}>
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <FileText size={16} color="#9b9b9b" />
            </div>
            <div>
              <p style={styles.infoLabel}>Total notes</p>
              <p style={styles.infoValue}>{profile.total_posts}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  loadingPage: {
    minHeight: '100vh',
    backgroundColor: '#191919',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9b9b9b',
    fontSize: '14px',
  },
  page: {
    minHeight: '100vh',
    backgroundColor: '#191919',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 32px',
    height: '52px',
    borderBottom: '1px solid #2e2e2e',
    backgroundColor: '#191919',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  navTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e8e8e8',
  },
  main: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '60px 32px',
  },
  avatarBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '48px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  username: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#e8e8e8',
    marginBottom: '4px',
  },
  email: {
    fontSize: '14px',
    color: '#9b9b9b',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #2e2e2e',
    borderRadius: '8px',
    padding: '16px 20px',
  },
  infoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: '12px',
    color: '#9b9b9b',
    marginBottom: '2px',
  },
  infoValue: {
    fontSize: '14px',
    color: '#e8e8e8',
    fontWeight: '500',
  },
}

export default Profile