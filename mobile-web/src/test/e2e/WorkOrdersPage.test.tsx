import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkOrdersPage from '@/app/work-orders/page'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/work-orders',
}))

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
  }),
}))

describe('WorkOrdersPage E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders work orders page successfully', async () => {
    render(<WorkOrdersPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Work Orders')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', async () => {
    render(<WorkOrdersPage />)
    
    // Should show loading skeletons initially
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})