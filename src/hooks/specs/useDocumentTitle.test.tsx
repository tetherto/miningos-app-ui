import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useDocumentTitle } from '../useDocumentTitle'

vi.mock('@/app/utils/format', () => ({ formatPageTitle: (path: string) => path || 'Home' }))
vi.mock('@/constants', () => ({ WEBAPP_NAME: 'TestApp' }))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
)

describe('useDocumentTitle', () => {
  it('sets document title from pathname', () => {
    renderHook(() => useDocumentTitle(), { wrapper })
    expect(document.title).toContain('TestApp')
  })
})
