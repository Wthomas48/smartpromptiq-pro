import React from 'react'
import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </nav>

      <h1>📊 Dashboard</h1>
      <p>This is a minimal dashboard component for testing.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>🤖 AI Prompts</h3>
          <p>0 Generated</p>
        </div>

        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>👥 Users</h3>
          <p>0 Active</p>
        </div>

        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>⚡ Status</h3>
          <p>System Online</p>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>🚀 Next Steps</h2>
        <ul>
          <li>Add authentication system</li>
          <li>Implement AI prompt generation</li>
          <li>Add user management</li>
          <li>Deploy to Railway</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard