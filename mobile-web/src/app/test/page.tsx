'use client'

export default function TestPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', border: '1px solid #f3f4f6' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1rem' }}>
            🎨 Styling Test
          </h1>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            If you can see this page with proper styling, CSS is working correctly!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
              ✅ Blue background with rounded corners
            </div>
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
              ✅ Green background with padding
            </div>
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
              ✅ Yellow background with text color
            </div>
          </div>
          <button style={{ width: '100%', marginTop: '1rem', background: '#2563eb', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
            Test Button - Hover Me!
          </button>
        </div>
        
        <div style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Gradient Test</h2>
          <p>If you see a purple to pink gradient, CSS gradients are working!</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
            Grid 1
          </div>
          <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
            Grid 2
          </div>
        </div>
      </div>
    </div>
  )
}