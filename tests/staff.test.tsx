import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

// 1. Mock Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

// 2. Mock Supabase - We return a "chainable" object so .from().select().eq() works
vi.mock('../app/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '123' } }, error: null })),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: { shop_name: 'Test Shop' }, error: null })),
    order: vi.fn(() => Promise.resolve({ data: [], error: null })), // empty list
  },
}))

// 3. Import the component AFTER the mocks are defined
import FirstLoginReview from '../app/review-details/page' 

describe('Staff Review Page', () => {
  it('renders "No staff members listed" when the list is empty', async () => {
    render(<FirstLoginReview />)

    // We use findByText (which is async) to wait for the useEffect to finish
    const emptyMessage = await screen.findByText(/No staff members listed/i)
    expect(emptyMessage).toBeInTheDocument()
  })
})