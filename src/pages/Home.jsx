import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, User, X, Plus, LogOut, Trash2, Pencil, Check } from 'lucide-react'
import axios from 'axios'

function Home() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  useEffect(() => { fetchPosts() }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/posts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPosts(res.data)
    } catch (err) { console.error(err) }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post('http://127.0.0.1:8000/posts',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTitle('')
      setContent('')
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPosts()
    } catch (err) { console.error(err) }
  }

  const startEdit = (post) => {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  const handleEdit = async (postId) => {
    try {
      await axios.put(`http://127.0.0.1:8000/posts/${postId}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingId(null)
      fetchPosts()
    } catch (err) { console.error(err) }
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

      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <PenLine size={18} color="#e8e8e8" />
          <span style={styles.navTitle}>PostIt</span>
        </div>
        <div style={styles.navRight} ref={dropdownRef}>
          <button onClick={() => setShowDropdown(prev => !prev)} style={styles.profileBtn}>
            <User size={18} color="#e8e8e8" />
          </button>
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownUser}>
                <span style={styles.dropdownUsername}>{username}</span>
              </div>
              <div style={styles.dropdownDivider} />
              <button style={styles.dropdownItem} onClick={() => navigate('/profile')}>
                <User size={14} /> Profile
              </button>
              <button style={{...styles.dropdownItem, color: '#f87171'}} onClick={handleLogout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div style={styles.main}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.greeting}>Good to see you, {username}.</h1>
            <p style={styles.sub}>What did you study today?</p>
          </div>
          <button style={styles.newNoteBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} /> New note
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <span style={styles.formTitle}>New note</span>
              <button style={styles.closeBtn} onClick={() => setShowForm(false)}>
                <X size={16} color="#9b9b9b" />
              </button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handlePost}>
              <input
                style={styles.formInput}
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <textarea
                style={styles.formTextarea}
                placeholder="What did you learn today?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <div style={styles.formFooter}>
                <button type="submit" style={loading ? {...styles.postBtn, opacity: 0.6} : styles.postBtn} disabled={loading}>
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {posts.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No notes yet. Hit "New note" to add your first one.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {posts.map(post => (
              <div key={post.id} style={styles.card}>
                {editingId === post.id ? (
                  <>
                    <input
                      style={styles.formInput}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <textarea
                      style={{...styles.formTextarea, minHeight: '80px'}}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                    <div style={styles.cardFooter}>
                      <button style={styles.saveBtn} onClick={() => handleEdit(post.id)}>
                        <Check size={13} /> Save
                      </button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={styles.cardDate}>{formatDate(post.created_at)}</span>
                    <h2 style={styles.cardTitle}>{post.title}</h2>
                    <p style={styles.cardContent}>{post.content}</p>
                    <div style={styles.cardFooter}>
                      <button style={styles.editBtn} onClick={() => startEdit(post)}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(post.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#191919' },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: '52px', borderBottom: '1px solid #2e2e2e',
    backgroundColor: '#191919', position: 'sticky', top: 0, zIndex: 100,
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  navTitle: { fontSize: '15px', fontWeight: '600', color: '#e8e8e8' },
  navRight: { position: 'relative' },
  profileBtn: {
    background: 'none', border: '1px solid #3a3a3a', borderRadius: '6px',
    padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute', right: 0, top: '40px', backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a', borderRadius: '8px', width: '180px', padding: '4px', zIndex: 200,
  },
  dropdownUser: { padding: '8px 12px' },
  dropdownUsername: { fontSize: '13px', color: '#9b9b9b' },
  dropdownDivider: { height: '1px', backgroundColor: '#3a3a3a', margin: '4px 0' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
    padding: '8px 12px', background: 'none', border: 'none', color: '#e8e8e8',
    fontSize: '13px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left',
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
  greeting: { fontSize: '28px', fontWeight: '700', color: '#e8e8e8', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#9b9b9b' },
  newNoteBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
    backgroundColor: '#e8e8e8', color: '#191919', border: 'none',
    borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  formCard: {
    backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e',
    borderRadius: '8px', padding: '20px 24px', marginBottom: '32px',
  },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  formTitle: { fontSize: '14px', fontWeight: '600', color: '#e8e8e8' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' },
  error: {
    backgroundColor: '#2e1a1a', border: '1px solid #5c2e2e', color: '#f87171',
    padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px',
  },
  formInput: {
    width: '100%', padding: '10px 12px', backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a', borderRadius: '6px', color: '#e8e8e8',
    fontSize: '14px', outline: 'none', marginBottom: '10px',
  },
  formTextarea: {
    width: '100%', padding: '10px 12px', backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a', borderRadius: '6px', color: '#e8e8e8',
    fontSize: '14px', outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit',
  },
  formFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '12px' },
  postBtn: {
    padding: '8px 20px', backgroundColor: '#e8e8e8', color: '#191919',
    border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  empty: { marginTop: '80px', textAlign: 'center' },
  emptyText: { color: '#9b9b9b', fontSize: '14px' },
  grid: { columns: '3 280px', columnGap: '16px' },
  card: {
    backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '8px',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px',
    breakInside: 'avoid', marginBottom: '16px',
  },
  cardDate: { fontSize: '11px', color: '#9b9b9b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#e8e8e8' },
  cardContent: { fontSize: '13px', color: '#9b9b9b', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
    backgroundColor: '#2a2a2a', color: '#9b9b9b', border: '1px solid #3a3a3a',
    borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', padding: '5px 8px',
    backgroundColor: '#2a2a2a', color: '#f87171', border: '1px solid #3a3a3a',
    borderRadius: '4px', cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
    backgroundColor: '#e8e8e8', color: '#191919', border: 'none',
    borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '5px 10px', backgroundColor: '#2a2a2a', color: '#9b9b9b',
    border: '1px solid #3a3a3a', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
  },
}

export default Home