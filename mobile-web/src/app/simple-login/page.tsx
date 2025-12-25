'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      console.log('Attempting login with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login result:', { data, error })

      if (error) {
        setResult(`Error: ${error.message}`)
      } else {
        setResult(`Success: Logged in as ${data.user?.email}`)
      }
    } catch (err) {
      console.error('Login exception:', err)
      setResult(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Login Test</h1>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h3>Result:</h3>
        <pre style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px'
        }}>
          {result || 'No login attempt yet'}
        </pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Use your existing GOGO Electric credentials</p>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  )
}