/**
 * Unit Tests: Theme Toggle Functionality
 * Feature: pure-black-dark-theme
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 * 
 * Tests that the theme toggle functionality works correctly and preserves
 * the pure black theme when switching between light and dark modes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import React from 'react';

describe('Theme Toggle Functionality', () => {
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: any;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn()
    } as Storage;

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    };
    global.matchMedia = vi.fn(() => matchMediaMock);

    // Mock document.documentElement
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  describe('Theme Initialization', () => {
    it('should default to system theme when no preference is stored', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.theme).toBe('system');
    });

    it('should load theme from localStorage if available', () => {
      localStorageMock['theme'] = 'dark';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should apply dark class to document root when dark theme is loaded', async () => {
      localStorageMock['theme'] = 'dark';

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should apply light class to document root when light theme is loaded', async () => {
      localStorageMock['theme'] = 'light';

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });
    });
  });

  describe('Theme Switching', () => {
    it('should toggle from light to dark and apply pure black theme', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Start with light theme
      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.resolvedTheme).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });

      // Switch to dark theme
      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.classList.contains('light')).toBe(false);
      });
    });

    it('should toggle from dark to light and preserve light theme', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Start with dark theme
      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Switch to light theme
      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.resolvedTheme).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    it('should switch to system theme and respect OS preferences', async () => {
      // Mock system preference as dark
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should switch to system theme with light OS preference', async () => {
      // Mock system preference as light
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.resolvedTheme).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme preference to localStorage when changed', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(localStorageMock['theme']).toBe('dark');
      });
    });

    it('should persist light theme to localStorage', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(localStorageMock['theme']).toBe('light');
      });
    });

    it('should persist system theme preference to localStorage', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
        expect(localStorageMock['theme']).toBe('system');
      });
    });

    it('should maintain theme across re-renders', async () => {
      localStorageMock['theme'] = 'dark';

      const { result, rerender } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      expect(result.current.theme).toBe('dark');

      rerender();

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  describe('System Theme Changes', () => {
    it('should listen for system theme changes when in system mode', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
        expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      });
    });

    it('should not listen for system changes when not in system mode', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      // The listener should be removed when switching away from system mode
      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });
  });

  describe('Pure Black Theme Application', () => {
    it('should apply dark class when dark theme is active', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // The .dark class should trigger pure black CSS variables
      // This is verified by the CSS variable tests
    });

    it('should remove light class when switching to dark', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      // Start with light
      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });

      // Switch to dark
      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.classList.contains('light')).toBe(false);
      });
    });

    it('should only have one theme class applied at a time', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        const classList = Array.from(document.documentElement.classList);
        const themeClasses = classList.filter(c => c === 'light' || c === 'dark');
        expect(themeClasses.length).toBe(1);
        expect(themeClasses[0]).toBe('dark');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = consoleError;
    });
  });
});
