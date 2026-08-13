import { useState, useEffect } from 'react'

import { notifySuccess } from '../../../app/utils/NotificationService'

import { DEFAULT_HEADER_PREFERENCES, HEADER_PREFERENCES_EVENTS, HeaderPreferences } from './types'

const STORAGE_KEY = 'headerControlsPreferences'

// Load preferences from localStorage
const loadPreferencesFromStorage = (): HeaderPreferences | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as HeaderPreferences
    }
  } catch {
    // Failed to load header preferences from localStorage
  }
  return null
}

// Save preferences to localStorage and notify other components
const savePreferencesToStorage = (preferences: HeaderPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event(HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED))
  } catch {
    // Failed to save header preferences to localStorage
  }
}

export const useHeaderControls = () => {
  // Initialize from localStorage or defaults
  const [preferences, setPreferences] = useState<HeaderPreferences>(
    () => loadPreferencesFromStorage() || DEFAULT_HEADER_PREFERENCES,
  )

  // Listen for storage changes (when settings are imported or updated in another component)
  useEffect(() => {
    const handleStorageChange = () => {
      const newPreferences = loadPreferencesFromStorage() || DEFAULT_HEADER_PREFERENCES
      setPreferences(newPreferences)
    }

    // Listen for custom event for same-tab updates (e.g., when importing settings)
    window.addEventListener(HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED, handleStorageChange)

    return () => {
      window.removeEventListener(HEADER_PREFERENCES_EVENTS.PREFERENCES_CHANGED, handleStorageChange)
    }
  }, [])

  const handleToggle = (key: keyof HeaderPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    savePreferencesToStorage(newPreferences)
    notifySuccess('Header preference updated', '')
  }

  const handleReset = () => {
    setPreferences(DEFAULT_HEADER_PREFERENCES)
    savePreferencesToStorage(DEFAULT_HEADER_PREFERENCES)
    notifySuccess('Header preferences reset to default', '')
  }

  return {
    preferences,
    isLoading: false,
    error: null,
    handleToggle,
    handleReset,
  }
}
