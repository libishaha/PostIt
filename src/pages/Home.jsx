import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, User, X, Plus } from 'lucide-react'
import axios from 'axios'

function Home() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/posts`,
        {headers : {Authorization: `Bearer ${token}`}}
      )
      setPosts(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`http://127.0.0.1:8000/posts?token=${token}`, { title, content }, 
        {headers: {Authorization: `Bearer ${token}`}}
      )
      setTitle('')
      setContent('')
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLogo}>
          <PenLine size={18} color="#e8e8e8" />
          <span style={styles.navTitle}>PostIt</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.profileBtn} onClick={handleLogout} title="Logout">
            <User size={18} color="#9b9b9b" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.content}>

        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.heading}>Good to see you, {username}.</h1>
            <p style={styles.sub}>What did you study today?</p>
          </div>
          <button style={styles.newBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New note
          </button>
        </div>

        {/* New post form */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <span style={styles.formTitle}>New note</span>
              <X size={18} color="#9b9b9b" style={{cursor: 'pointer'}} onClick={() => setShowForm(false)} />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handlePost} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <textarea
                style={styles.textarea}
                placeholder="What did you learn?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={5}
              />
              <button style={loading ? {...styles.submitBtn, opacity: 0.6} : styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div style={styles.empty}>
            <PenLine size={32} color="#3a3a3a" />
            <p style={styles.emptyText}>No notes yet. Add your first one.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {posts.map(post => (
              <div key={post.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardDate}>{formatDate(post.created_at)}</span>
                </div>
                <h2 style={styles.cardTitle}>{post.title}</h2>
                <p style={styles.cardContent}>{post.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#191919',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '52px',
    borderBottom: '1px solid #2e2e2e',
    backgroundColor: '#191919',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e8e8e8',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
  },
  profileBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '40px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#e8e8e8',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '14px',
    color: '#9b9b9b',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#e8e8e8',
    color: '#191919',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formCard: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #2e2e2e',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '32px',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  formTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e8e8e8',
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
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#e8e8e8',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#e8e8e8',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    alignSelf: 'flex-end',
    padding: '8px 20px',
    backgroundColor: '#e8e8e8',
    color: '#191919',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '80px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#5a5a5a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #2e2e2e',
    borderRadius: '8px',
    padding: '20px',
  },
  cardHeader: {
    marginBottom: '10px',
  },
  cardDate: {
    fontSize: '11px',
    color: '#5a5a5a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e8e8e8',
    marginBottom: '8px',
  },
  cardContent: {
    fontSize: '13px',
    color: '#9b9b9b',
    lineHeight: '1.6',
  },
}

export default Home