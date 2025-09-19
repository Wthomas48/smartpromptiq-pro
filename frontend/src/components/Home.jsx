import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [healthStatus, setHealthStatus] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => console.error('Health check failed:', err))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🚀 SmartPromptIQ</h1>
      <p>Railway-Optimized AI SaaS Platform</p>

      <div style={{ margin: '2rem 0' }}>
        <h2>System Status</h2>
        <div style={{
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: healthStatus ? '#f0f8ff' : '#fff5f5'
        }}>
          {healthStatus ? (
            <>
              <p>✅ API Status: {healthStatus.status}</p>
              <p>🕒 Last Check: {healthStatus.timestamp}</p>
            </>
          ) : (
            <p>⏳ Checking API status...</p>
          )}
        </div>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <Link
          to="/dashboard"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Go to Dashboard
        </Link>
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666' }}>
        <h3>🛠️ Build Information</h3>
        <ul>
          <li>React Frontend ✅</li>
          <li>Express Backend ✅</li>
          <li>Railway Deployment Ready ✅</li>
          <li>Clean Module Structure ✅</li>
        </ul>
      </div>
    </div>
  )
}

export default Home