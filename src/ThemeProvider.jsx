import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      background: isDark ? '#121212' : '#ffffff',
      surface: isDark ? '#1e1e1e' : '#f9f9f9',
      primary: '#1DB954',
      text: isDark ? '#ffffff' : '#333333',
      textSecondary: isDark ? '#b3b3b3' : '#666666',
      border: isDark ? '#333333' : '#ddd',
      card: isDark ? '#2a2a2a' : '#ffffff'
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        transition: 'all 0.3s ease'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}