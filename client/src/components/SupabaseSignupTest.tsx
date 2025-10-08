import React, { useState } from 'react'
import { useSupabaseAuth } from '../lib/supabase-auth'

export function SupabaseSignupTest() {
  const {
    loading,
    error,
    user,
    profile,
    signupWithEmailPassword,
    signupWithOAuth,
    signOut,
    reset
  } = useSupabaseAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('🧪 Testing Supabase signup with:', formData)
      const result = await signupWithEmailPassword(
        formData.email,
        formData.password,
        formData.fullName || undefined
      )

      console.log('📋 Signup result:', result)

      if (result.needsEmailConfirmation) {
        setEmailConfirmationNeeded(true)
      }
    } catch (error) {
      console.error('❌ Signup test failed:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleReset = () => {
    reset()
    setEmailConfirmationNeeded(false)
    setFormData({ email: '', password: '', fullName: '' })
  }

  // Success states
  if (emailConfirmationNeeded) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3 style={{ color: '#1976d2' }}>✅ Signup Successful - Email Confirmation Required</h3>
        <p>We've sent you a confirmation link. Please check your email to activate your account.</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <button onClick={handleReset} style={{
          padding: '8px 16px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Test Another Signup
        </button>
      </div>
    )
  }

  if (user && profile) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3 style={{ color: '#2e7d32' }}>🎉 Supabase Auth Success!</h3>
        <div style={{ marginBottom: '15px' }}>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <h4>Profile Data:</h4>
          <p><strong>Profile ID:</strong> {profile.id}</p>
          <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
          <p><strong>Avatar URL:</strong> {profile.avatar_url || 'Not set'}</p>
          <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={signOut}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Another Signup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🧪 Supabase Signup Test</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Testing Supabase auth integration with profile auto-creation
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            placeholder="test@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Full Name (optional):
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '🔄 Creating account...' : '🚀 Test Supabase Signup'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <span style={{ color: '#666' }}>or test OAuth</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          onClick={() => signupWithOAuth('google')}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#db4437',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔗 Google
        </button>

        <button
          type="button"
          onClick={() => signupWithOAuth('github')}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔗 GitHub
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #f8bbd9',
          borderRadius: '4px'
        }}>
          <strong>❌ Error:</strong> {error}
          <button
            onClick={reset}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: '#c62828',
              border: '1px solid #c62828',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e1f5fe',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#0277bd'
      }}>
        <strong>🔍 Test Checklist:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Email/password signup with profile creation</li>
          <li>Profile fetch with retry logic (handles DB trigger delay)</li>
          <li>Full name auto-update if provided</li>
          <li>OAuth provider testing (redirects to auth)</li>
          <li>Error handling for common auth issues</li>
        </ul>
      </div>
    </div>
  )
}