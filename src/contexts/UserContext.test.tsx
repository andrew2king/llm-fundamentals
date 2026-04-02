import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { UserProvider, useUser, ALL_SECTIONS } from '@/contexts/UserContext'
import type { ReactNode } from 'react'

// Helper component to test context
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    learningProgress,
    login,
    logout,
    markSectionVisited,
    markSectionCompleted,
    saveQuizScore,
    getOverallProgress,
  } = useUser()

  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="userName">{user?.name || 'Not logged in'}</div>
      <div data-testid="visitedCount">{learningProgress.visitedSections.length}</div>
      <div data-testid="completedCount">{learningProgress.completedSections.length}</div>
      <div data-testid="overallProgress">{getOverallProgress()}</div>
      <button data-testid="loginBtn" onClick={() => login('test@example.com', 'Test User')}>
        Login
      </button>
      <button data-testid="logoutBtn" onClick={logout}>
        Logout
      </button>
      <button data-testid="visitBtn" onClick={() => markSectionVisited('learning-path')}>
        Visit Section
      </button>
      <button data-testid="completeBtn" onClick={() => markSectionCompleted('learning-path')}>
        Complete Section
      </button>
      <button data-testid="quizBtn" onClick={() => saveQuizScore('quiz-1', 85)}>
        Save Quiz
      </button>
    </div>
  )
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ALL_SECTIONS constant', () => {
    it('should be a non-empty array', () => {
      expect(ALL_SECTIONS).toBeInstanceOf(Array)
      expect(ALL_SECTIONS.length).toBeGreaterThan(0)
    })

    it('should contain expected section IDs', () => {
      expect(ALL_SECTIONS).toContain('learning-path')
      expect(ALL_SECTIONS).toContain('core-knowledge')
      expect(ALL_SECTIONS).toContain('quiz')
    })
  })

  describe('UserProvider', () => {
    it('should render children', () => {
      render(
        <UserProvider>
          <div data-testid="child">Child Component</div>
        </UserProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should provide default values when not logged in', () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
      expect(screen.getByTestId('userName').textContent).toBe('Not logged in')
    })

    it('should handle login correctly', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('loginBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
        expect(screen.getByTestId('userName').textContent).toBe('Test User')
      })
    })

    it('should handle logout correctly', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      // Login first
      fireEvent.click(screen.getByTestId('loginBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
      })

      // Then logout
      fireEvent.click(screen.getByTestId('logoutBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
        expect(screen.getByTestId('userName').textContent).toBe('Not logged in')
      })
    })

    it('should handle section visit correctly', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('visitBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('visitedCount').textContent).toBe('1')
      })
    })

    it('should not duplicate visited sections', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      // Visit twice
      fireEvent.click(screen.getByTestId('visitBtn'))
      fireEvent.click(screen.getByTestId('visitBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('visitedCount').textContent).toBe('1')
      })
    })

    it('should handle section completion correctly', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('completeBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('completedCount').textContent).toBe('1')
      })
    })

    it('should not duplicate completed sections', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      // Complete twice
      fireEvent.click(screen.getByTestId('completeBtn'))
      fireEvent.click(screen.getByTestId('completeBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('completedCount').textContent).toBe('1')
      })
    })

    it('should handle quiz score saving', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('quizBtn'))

      // Quiz scores are stored internally
      await waitFor(() => {
        // No visible change, but should not throw
        expect(screen.getByTestId('quizBtn')).toBeInTheDocument()
      })
    })

    it('should calculate overall progress correctly', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      // Initially 0 progress
      expect(screen.getByTestId('overallProgress').textContent).toBe('0')

      // Complete a section
      fireEvent.click(screen.getByTestId('completeBtn'))

      await waitFor(() => {
        const progress = parseInt(screen.getByTestId('overallProgress').textContent || '0')
        const expectedProgress = Math.round((1 / ALL_SECTIONS.length) * 100)
        expect(progress).toBe(expectedProgress)
      })
    })
  })

  describe('useUser hook', () => {
    it('should return context values when used within provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UserProvider>{children}</UserProvider>
      )

      const { result } = renderHook(() => useUser(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.learningProgress).toBeDefined()
      expect(result.current.login).toBeInstanceOf(Function)
      expect(result.current.logout).toBeInstanceOf(Function)
    })

    it('should return default values when used outside provider', () => {
      // The hook has a fallback for being used outside provider
      const { result } = renderHook(() => useUser())

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.learningProgress).toBeDefined()
      expect(result.current.login).toBeInstanceOf(Function)
      expect(result.current.logout).toBeInstanceOf(Function)
    })

    it('should update user state on login', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UserProvider>{children}</UserProvider>
      )

      const { result } = renderHook(() => useUser(), { wrapper })

      act(() => {
        result.current.login('new@example.com', 'New User')
      })

      expect(result.current.user?.email).toBe('new@example.com')
      expect(result.current.user?.name).toBe('New User')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should update learning progress on section actions', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UserProvider>{children}</UserProvider>
      )

      const { result } = renderHook(() => useUser(), { wrapper })

      act(() => {
        result.current.markSectionVisited('test-section')
      })

      expect(result.current.learningProgress.visitedSections).toContain('test-section')

      act(() => {
        result.current.markSectionCompleted('completed-section')
      })

      expect(result.current.learningProgress.completedSections).toContain('completed-section')
    })

    it('should update quiz scores', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UserProvider>{children}</UserProvider>
      )

      const { result } = renderHook(() => useUser(), { wrapper })

      act(() => {
        result.current.saveQuizScore('quiz-test', 90)
      })

      expect(result.current.learningProgress.quizScores['quiz-test']).toBe(90)
    })

    it('should return correct overall progress', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <UserProvider>{children}</UserProvider>
      )

      const { result } = renderHook(() => useUser(), { wrapper })

      // Initial progress is 0
      expect(result.current.getOverallProgress()).toBe(0)

      // Complete one section
      act(() => {
        result.current.markSectionCompleted(ALL_SECTIONS[0])
      })

      const expectedProgress = Math.round((1 / ALL_SECTIONS.length) * 100)
      expect(result.current.getOverallProgress()).toBe(expectedProgress)
    })
  })

  describe('localStorage integration', () => {
    it('should save progress to localStorage', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('completeBtn'))

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled()
      })
    })

    it('should save user to localStorage on login', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      fireEvent.click(screen.getByTestId('loginBtn'))

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'llm_user',
          expect.stringContaining('Test User')
        )
      })
    })

    it('should remove user from localStorage on logout', async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      )

      // Login first
      fireEvent.click(screen.getByTestId('loginBtn'))

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
      })

      // Then logout
      fireEvent.click(screen.getByTestId('logoutBtn'))

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('llm_user')
      })
    })
  })
})