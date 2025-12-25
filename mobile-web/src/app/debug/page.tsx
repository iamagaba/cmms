'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function DebugPage() {
  const [testResult, setTestResult] = useState('')
  const { session, isLoading } = useAuth()

  const testSupabase = async () => {
    try {
      const { data, error } = await supabase.from('work_orders').select('count').limit(1)
      if (error) {
        setTestResult(`Supabase Error: ${error.message}`)
      } else {
        setTestResult(`Supabase Connected: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      setTestResult(`Connection Error: ${err}`)
    }
  }

  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setTestResult(`Auth Error: ${error.message}`)
      } else {
        setTestResult(`Auth Status: ${data.session ? 'Logged in' : 'Not logged in'}`)
      }
    } catch (err) {
      setTestResult(`Auth Connection Error: ${err}`)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Styling Test</h2>
        <div style={{ background: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          This should be blue with white text and rounded corners
        </div>
        <button style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
          CSS Button Test
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Context Test</h2>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Session: {session ? 'Exists' : 'None'}</p>
        <button onClick={testAuth} style={{ padding: '10px', margin: '5px' }}>
          Test Auth
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Supabase Test</h2>
        <button onClick={testSupabase} style={{ padding: '10px', margin: '5px' }}>
          Test Supabase Connection
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Results</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px', whiteSpace: 'pre-wrap' }}>
          {testResult || 'No tests run yet'}
        </pre>
      </div>
    </div>
  )
}